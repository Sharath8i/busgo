import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bus from './src/models/Bus.model.js';
import Trip from './src/models/Trip.model.js';
import User from './src/models/User.model.js';
import Route from './src/models/Route.model.js';
import Schedule from './src/models/Schedule.model.js';

dotenv.config();

const ALL_ROUTES = [
  { from: 'Chennai', to: 'Bangalore', duration: '6h 15m', price: 849 },
  { from: 'Mumbai', to: 'Pune', duration: '3h 00m', price: 399 },
  { from: 'Delhi', to: 'Agra', duration: '4h 30m', price: 650 },
  { from: 'Hyderabad', to: 'Vijayawada', duration: '5h 10m', price: 599 },
  { from: 'Bangalore', to: 'Goa', duration: '11h 20m', price: 1250 },
  { from: 'Chennai', to: 'Madurai', duration: '7h 45m', price: 799 },
  { from: 'Delhi', to: 'Jaipur', duration: '5h 00m', price: 600 },
  { from: 'Ahmedabad', to: 'Surat', duration: '4h 15m', price: 450 },
  { from: 'Pune', to: 'Nagpur', duration: '12h 30m', price: 1400 },
  { from: 'Kolkata', to: 'Siliguri', duration: '14h 00m', price: 1100 },
  { from: 'Bangalore', to: 'Mysore', duration: '3h 15m', price: 350 },
  { from: 'Mumbai', to: 'Goa', duration: '14h 00m', price: 1550 },
  { from: 'Chandigarh', to: 'Shimla', duration: '3h 45m', price: 299 },
  { from: 'Lucknow', to: 'Varanasi', duration: '6h 30m', price: 550 },
  { from: 'Kochi', to: 'Thiruvananthapuram', duration: '5h 20m', price: 499 },
];

const getMin = (dur) => {
   const matchH = dur.match(/(\d+)h/);
   const matchM = dur.match(/(\d+)m/);
   const h = matchH ? parseInt(matchH[1]) : 0;
   const m = matchM ? parseInt(matchM[1]) : 0;
   return h * 60 + m;
};

const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Transit DB...');

        let operator = await User.findOne({ role: 'operator', email: 'global_ops@busgo.test' });
        if (!operator) {
            operator = await User.create({
                fullName: 'Global Prestige Operator',
                email: 'global_ops@busgo.test',
                passwordHash: '$2b$10$wT3T.GjYh8F9Hh9FwT3K1O', // Safe mock hash
                phone: '9999999999',
                role: 'operator',
                isVerified: true
            });
        }

        for (const rData of ALL_ROUTES) {
            const timeMin = getMin(rData.duration);
            const dist = Math.floor(timeMin * 0.8); // Approximate speed

            // Note: Many origins and destinations are case-sensitive or slightly different in real user input,
            // but the destination grid specifically uses these spellings.
            const route = await Route.findOneAndUpdate(
                { originCity: rData.from, destinationCity: rData.to },
                { 
                    originCity: rData.from, 
                    destinationCity: rData.to, 
                    distanceKm: dist, 
                    estimatedMinutes: timeMin,
                    operatorId: operator._id 
                },
                { upsert: true, new: true }
            );

            const regNo = `IND-${rData.from.slice(0,2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
            const bus = await Bus.create({
                busName: `Premium Fleet ${rData.from.slice(0,3)}`,
                busType: rData.price > 800 ? 'volvo' : 'sleeper',
                registrationNo: regNo,
                totalSeats: 36,
                operatorId: operator._id,
                isActive: true
            });

            // Calculate Arrival Time (Departure at 20:00)
            const depMin = 20 * 60; // 8 PM
            const arrMin = depMin + timeMin;

            const schedule = await Schedule.create({
                busId: bus._id,
                routeId: route._id,
                departureTime: '20:00',
                arrivalTime: formatTime(arrMin),
                operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                baseFare: rData.price,
                status: 'active'
            });

            // Create trips for the next 15 days
            for (let i = 0; i < 15; i++) {
                const travelDate = new Date();
                travelDate.setDate(travelDate.getDate() + i);
                travelDate.setHours(0, 0, 0, 0);

                await Trip.findOneAndUpdate(
                    { scheduleId: schedule._id, travelDate: travelDate },
                    { scheduleId: schedule._id, travelDate: travelDate, status: 'scheduled' },
                    { upsert: true }
                );
            }

            console.log(`✅ Deployed: ${rData.from} -> ${rData.to} for next 15 Days`);
        }

        console.log('\n--- GLOBAL ROUTES COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Failed:', err);
        process.exit(1);
    }
};

seed();
