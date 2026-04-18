import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true,
    },
    travelDate: { type: Date, required: true },
    bookedSeats: [{ type: String }],
    heldSeats: [
      {
        seatNumber: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        heldUntil: { type: Date, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['scheduled', 'running', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

tripSchema.index({ scheduleId: 1, travelDate: 1 }, { unique: true });

export default mongoose.model('Trip', tripSchema);
