import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.model.js';

dotenv.config();

async function create() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const hash = await bcrypt.hash('Test@1234', 12);
    
    // Check if exists
    const existing = await User.findOne({ email: 'op@busgo.test' });
    if (existing) {
      console.log('Account already exists. Ensuring it is approved...');
      existing.status = 'approved';
      existing.role = 'operator';
      await existing.save();
    } else {
      await User.create({
        fullName: 'Demo Operator',
        email: 'op@busgo.test',
        phone: '9999988880',
        passwordHash: hash,
        role: 'operator',
        status: 'approved',
        isVerified: true
      });
      console.log('✅ Operator account successfully created!');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

create();
