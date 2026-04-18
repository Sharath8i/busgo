import Route from '../../models/Route.model.js';
import Schedule from '../../models/Schedule.model.js';
import Trip from '../../models/Trip.model.js';
import Bus from '../../models/Bus.model.js';
import { asyncHandler } from '../../middlewares/error.middleware.js';
import { dayAbbrev, startOfTravelDay, endOfTravelDay } from '../../utils/dateHelpers.js';

export const listCities = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  const origins = await Route.distinct('originCity');
  const dests = await Route.distinct('destinationCity');
  const all = [...new Set([...origins, ...dests])];
  const filtered = q
    ? all.filter((c) => c.toLowerCase().includes(q.toLowerCase()))
    : all;
  res.json({ cities: filtered.slice(0, 20) });
});

export const searchBuses = asyncHandler(async (req, res) => {
  const { from, to, date, seats } = req.query;
  if (!from || !to || !date) {
    return res.status(400).json({ message: 'from, to, and date are required' });
  }
  const needSeats = Math.max(1, parseInt(seats, 10) || 1);
  const day = dayAbbrev(date);
  const routes = await Route.find({
    originCity: new RegExp(`^${escapeRegex(from)}$`, 'i'),
    destinationCity: new RegExp(`^${escapeRegex(to)}$`, 'i'),
  });
  if (!routes.length) {
    return res.json({ results: [] });
  }
  const routeIds = routes.map((r) => r._id);
  const schedules = await Schedule.find({
    routeId: { $in: routeIds },
    status: 'active',
    operatingDays: day,
  })
    .populate({ path: 'busId', model: Bus })
    .populate('routeId');

  const t0 = startOfTravelDay(date);
  const t1 = endOfTravelDay(date);
  const scheduleIds = schedules.map((s) => s._id);
  const trips = await Trip.find({
    scheduleId: { $in: scheduleIds },
    travelDate: { $gte: t0, $lte: t1 },
    status: { $ne: 'cancelled' },
  });

  const tripBySchedule = new Map(trips.map((t) => [t.scheduleId.toString(), t]));

  const results = [];
  for (const s of schedules) {
    const bus = s.busId;
    if (!bus?.isActive) continue;
    let trip = tripBySchedule.get(s._id.toString());
    if (!trip) {
      trip = await Trip.create({
        scheduleId: s._id,
        travelDate: t0,
        bookedSeats: [],
        heldSeats: [],
        status: 'scheduled',
      });
    }
    const total = bus.totalSeats || bus.seatLayout?.length || 0;
    const heldActive = trip.heldSeats.filter((h) => h.heldUntil > new Date());
    const unavailable = new Set([...trip.bookedSeats, ...heldActive.map((h) => h.seatNumber)]);
    const available = total - unavailable.size;
    if (available < needSeats) continue;

    results.push({
      tripId: trip._id,
      scheduleId: s._id,
      busName: bus.busName,
      busType: bus.busType,
      operatorId: bus.operatorId,
      departureTime: s.departureTime,
      arrivalTime: s.arrivalTime,
      baseFare: s.baseFare,
      amenities: bus.amenities || [],
      availableSeats: available,
      route: {
        originCity: s.routeId.originCity,
        destinationCity: s.routeId.destinationCity,
      },
    });
  }

  res.json({ results });
});

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const getTripSeats = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const trip = await Trip.findById(tripId).populate({
    path: 'scheduleId',
    populate: { path: 'busId', model: Bus },
  });
  if (!trip?.scheduleId?.busId) {
    return res.status(404).json({ message: 'Trip not found' });
  }
  const bus = trip.scheduleId.busId;
  const layout = bus.seatLayout?.length
    ? bus.seatLayout
    : Array.from({ length: bus.totalSeats }, (_, i) => ({
        seatNumber: String(i + 1),
        seatType: 'seater',
      }));
  const now = new Date();
  const held = trip.heldSeats.filter((h) => h.heldUntil > now);
  const heldBySeat = new Map(held.map((h) => [h.seatNumber, h.userId.toString()]));
  const booked = new Set(trip.bookedSeats);

  const seats = layout.map((cell) => {
    const num = cell.seatNumber;
    let status = 'available';
    if (booked.has(num)) status = 'booked';
    else if (heldBySeat.has(num)) status = 'held';
    return { seatNumber: num, seatType: cell.seatType, status };
  });

  res.json({ seats, busName: bus.busName, busType: bus.busType });
});

export const holdSeats = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { seats } = req.body;
  const userId = req.user.userId;
  if (!Array.isArray(seats) || !seats.length) {
    return res.status(400).json({ message: 'seats array required' });
  }
  const holdUntil = new Date(Date.now() + 10 * 60 * 1000);
  const trip = await Trip.findById(tripId).populate({
    path: 'scheduleId',
    populate: { path: 'busId', model: Bus },
  });
  if (!trip) return res.status(404).json({ message: 'Trip not found' });

  const valid = new Set(
    (trip.scheduleId.busId.seatLayout?.length
      ? trip.scheduleId.busId.seatLayout
      : Array.from({ length: trip.scheduleId.busId.totalSeats }, (_, i) => ({
          seatNumber: String(i + 1),
        }))
    ).map((x) => x.seatNumber)
  );

  for (const s of seats) {
    if (!valid.has(s)) {
      return res.status(400).json({ message: `Invalid seat: ${s}` });
    }
  }

  const now = new Date();
  trip.heldSeats = trip.heldSeats.filter((h) => h.heldUntil > now);
  for (const s of seats) {
    if (trip.bookedSeats.includes(s)) {
      return res.status(409).json({ message: `Seat ${s} already booked` });
    }
    const other = trip.heldSeats.find(
      (h) => h.seatNumber === s && h.userId.toString() !== userId
    );
    if (other) {
      return res.status(409).json({ message: `Seat ${s} held by another user` });
    }
  }
  trip.heldSeats = trip.heldSeats.filter((h) => h.userId.toString() !== userId);
  for (const s of seats) {
    trip.heldSeats.push({ seatNumber: s, userId, heldUntil: holdUntil });
  }
  await trip.save();
  res.json({ message: 'Seats held', heldUntil: holdUntil.toISOString() });
});

export const releaseSeats = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { seats } = req.body;
  const userId = req.user.userId;
  if (!Array.isArray(seats)) {
    return res.status(400).json({ message: 'seats array required' });
  }
  const trip = await Trip.findById(tripId);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  trip.heldSeats = trip.heldSeats.filter(
    (h) => !(h.userId.toString() === userId && seats.includes(h.seatNumber))
  );
  await trip.save();
  res.json({ message: 'Released' });
});
export const getTripSummary = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const trip = await Trip.findById(tripId).populate({
    path: 'scheduleId',
    populate: ['busId', 'routeId'],
  });
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  const s = trip.scheduleId;
  const bus = s.busId;
  res.json({
    tripId: trip._id,
    busName: bus.busName,
    busType: bus.busType,
    departureTime: s.departureTime,
    arrivalTime: s.arrivalTime,
    baseFare: s.baseFare,
    from: s.routeId.originCity,
    to: s.routeId.destinationCity,
    travelDate: trip.travelDate
  });
});
