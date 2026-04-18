import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema(
  {
    originCity: { type: String, required: true },
    destinationCity: { type: String, required: true },
    distanceKm: { type: Number },
    estimatedMinutes: { type: Number },
    stops: [
      {
        cityName: { type: String },
        arrivalOffset: { type: Number },
      },
    ],
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Route', routeSchema);
