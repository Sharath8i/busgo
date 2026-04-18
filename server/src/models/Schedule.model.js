import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    operatingDays: [
      { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    ],
    baseFare: { type: Number, required: true },
    status: { type: String, enum: ['active', 'paused'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model('Schedule', scheduleSchema);
