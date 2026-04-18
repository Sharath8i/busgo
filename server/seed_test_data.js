import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bus from './src/models/Bus.model.js';
import Trip from './src/models/Trip.model.js';
import User from './src/models/User.model.js';
import Route from './src/models/Route.model.js';
import Schedule from './src/models/Schedule.model.js';

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Fleet DB...');

        // 1. Find or create an operator
        let operator = await User.findOne({ role: 'operator' });
        if (!operator) {
            console.log('Creating test operator...');
            operator = await User.create({
                fullName: 'Elite Operator',
                email: 'operator@busgo.test',
                password: 'password123',
                role: 'operator',
                isVerified: true
            });
        }

        // 2. Create Route
        const route = await Route.findOneAndUpdate(
            { originCity: 'Mumbai', destinationCity: 'Pune' },
            { 
                originCity: 'Mumbai', 
                destinationCity: 'Pune', 
                distanceKm: 150, 
                estimatedMinutes: 180,
                operatorId: operator._id 
            },
            { upsert: true, new: true }
        );
        console.log('Route Established:', route.originCity, '->', route.destinationCity);

        // 3. Register a Luxury Bus
        const registrationNo = 'MH-12-BG-2026';
        let bus = await Bus.findOne({ registrationNo });
        if (!bus) {
            bus = await Bus.create({
                busName: 'BusGo Platinum Scania',
                busType: 'sleeper',
                registrationNo: registrationNo,
                totalSeats: 30,
                operatorId: operator._id,
                isActive: true
            });
        }
        console.log('Bus Registered:', bus.busName);

        // 4. Create Schedule
        const schedule = await Schedule.create({
            busId: bus._id,
            routeId: route._id,
            departureTime: '22:00',
            arrivalTime: '01:00',
            operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            baseFare: 850,
            status: 'active'
        });
        console.log('Schedule Created for 10:00 PM');

        // 5. Create a live trip for Tonight or Tomorrow
        const travelDate = new Date();
        travelDate.setHours(0, 0, 0, 0); // Start of today

        // Use updateOne with upsert to avoid duplicate index error if script runs twice
        await Trip.findOneAndUpdate(
            { scheduleId: schedule._id, travelDate: travelDate },
            { 
                scheduleId: schedule._id, 
                travelDate: travelDate,
                status: 'scheduled'
            },
            { upsert: true, new: true }
        );
        
        console.log('Trip Active for Date:', travelDate.toLocaleDateString());
        console.log('--- SEEDING COMPLETE ---');
        console.log('SEARCH PARAMS: From Mumbai to Pune');
        process.exit(0);
    } catch (err) {
        console.error('Seeding Failed:', err);
        process.exit(1);
    }
};

seed();
