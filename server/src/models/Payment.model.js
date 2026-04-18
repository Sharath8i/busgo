import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    razorpayOrderId: { type: String, required: false },
    razorpayPaymentId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    method: { type: String },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created',
    },
    refundId: { type: String },
    refundAmount: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
