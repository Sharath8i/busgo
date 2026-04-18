import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['passenger', 'operator', 'admin'],
      default: 'passenger',
    },
    isVerified: { type: Boolean, default: false },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    profilePic: { type: String },
    refreshTokenHash: { type: String },
    isActive: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    walletBalance: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
