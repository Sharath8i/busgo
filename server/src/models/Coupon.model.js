import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['flat', 'percent'], required: true },
    discountValue: { type: Number, required: true },
    minFare: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    validFrom: { type: Date },
    validTill: { type: Date },
    usageLimit: { type: Number },
    timesUsed: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Coupon', couponSchema);
