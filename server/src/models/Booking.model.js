import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    pnr: { type: String, unique: true, required: true },
    passengers: [
      {
        seatNumber: { type: String, required: true },
        name: { type: String, required: true },
        age: { type: Number, required: true },
        gender: { type: String, enum: ['M', 'F', 'Other'], required: true },
        idProofType: { type: String },
        idProofNo: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    refundAmount: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
