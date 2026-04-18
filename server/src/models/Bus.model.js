import mongoose from 'mongoose';

const busSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    busName: { type: String, required: true },
    registrationNo: { type: String, required: true, unique: true },
    busType: {
      type: String,
      enum: ['sleeper', 'semi_sleeper', 'seater', 'volvo'],
      required: true,
    },
    totalSeats: { type: Number, required: true },
    amenities: [{ type: String }],
    seatLayout: [
      {
        seatNumber: { type: String, required: true },
        seatType: {
          type: String,
          enum: ['lower', 'upper', 'window', 'aisle'],
        },
      },
    ],
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Bus', busSchema);
