import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bus from './src/models/Bus.model.js';
import Trip from './src/models/Trip.model.js';
import User from './src/models/User.model.js';
import Route from './src/models/Route.model.js';
import Schedule from './src/models/Schedule.model.js';

dotenv.config();

const KARNATAKA_ROUTES = [
    { from: 'Bangalore', to: 'Mysore', dist: 145, time: 180, price: 450 },
    { from: 'Bangalore', to: 'Mangalore', dist: 350, time: 480, price: 950 },
    { from: 'Bangalore', to: 'Hubli', dist: 410, time: 420, price: 800 },
    { from: 'Bangalore', to: 'Belgaum', dist: 510, time: 540, price: 1100 },
    { from: 'Bangalore', to: 'Udupi', dist: 400, time: 540, price: 1000 },
    { from: 'Bangalore', to: 'Shimoga', dist: 300, time: 360, price: 650 },
    { from: 'Bangalore', to: 'Hassan', dist: 180, time: 240, price: 350 },
    { from: 'Mysore', to: 'Mangalore', dist: 250, time: 360, price: 600 },
    { from: 'Hubli', to: 'Belgaum', dist: 100, time: 120, price: 250 },
    { from: 'Bangalore', to: 'Bellary', dist: 310, time: 420, price: 700 },
    { from: 'Bangalore', to: 'Gulbarga', dist: 620, time: 660, price: 1300 },
    { from: 'Bangalore', to: 'Davanagere', dist: 260, time: 300, price: 500 },
    { from: 'Bangalore', to: 'Bijapur', dist: 520, time: 600, price: 1150 },
    { from: 'Bangalore', to: 'Bidar', dist: 700, time: 780, price: 1500 },
    { from: 'Mysore', to: 'Hassan', dist: 120, time: 180, price: 300 }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Transit DB...');

        let operator = await User.findOne({ role: 'operator' });
        if (!operator) {
            operator = await User.create({
                fullName: 'KSRTC Elite Partner',
                email: 'karnataka_ops@busgo.test',
                password: 'password123',
                role: 'operator',
                isVerified: true
            });
        }

        const travelDate = new Date();
        travelDate.setHours(0, 0, 0, 0);

        for (const rData of KARNATAKA_ROUTES) {
            // 1. Create Route
            const route = await Route.findOneAndUpdate(
                { originCity: rData.from, destinationCity: rData.to },
                { 
                    originCity: rData.from, 
                    destinationCity: rData.to, 
                    distanceKm: rData.dist, 
                    estimatedMinutes: rData.time,
                    operatorId: operator._id 
                },
                { upsert: true, new: true }
            );

            // 2. Create/Get Bus for this route
            const regNo = `KA-01-BK-${Math.floor(1000 + Math.random() * 9000)}`;
            const bus = await Bus.create({
                busName: `BusGo Airavat ${rData.from.slice(0,3)}`,
                busType: rData.price > 800 ? 'volvo' : 'sleeper',
                registrationNo: regNo,
                totalSeats: 36,
                operatorId: operator._id,
                isActive: true
            });

            // 3. Create Schedule
            const schedule = await Schedule.create({
                busId: bus._id,
                routeId: route._id,
                departureTime: '21:30',
                arrivalTime: '05:30',
                operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                baseFare: rData.price,
                status: 'active'
            });

            // 4. Create Trip
            await Trip.findOneAndUpdate(
                { scheduleId: schedule._id, travelDate: travelDate },
                { scheduleId: schedule._id, travelDate: travelDate, status: 'scheduled' },
                { upsert: true }
            );

            console.log(`✅ Established: ${rData.from} -> ${rData.to} (${bus.busName})`);
        }

        console.log('\n--- KARNATAKA NETWORK EXPANSION COMPLETE ---');
        console.log(`Total Routes Added: ${KARNATAKA_ROUTES.length}`);
        process.exit(0);
    } catch (err) {
        console.error('Expansion Failed:', err);
        process.exit(1);
    }
};

seed();
