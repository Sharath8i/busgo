import 'dotenv/config';
import cron from 'node-cron';
import app from './app.js';
import { connectDB } from './src/config/db.js';
import { configureCloudinary } from './src/config/cloudinary.js';
import Trip from './src/models/Trip.model.js';

configureCloudinary();

const PORT = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET?.trim() || !process.env.JWT_REFRESH_SECRET?.trim()) {
  console.error('Missing JWT_SECRET or JWT_REFRESH_SECRET in server/.env (copy from .env.example).');
  process.exit(1);
}

await connectDB();

cron.schedule('* * * * *', async () => {
  const now = new Date();
  try {
    await Trip.updateMany(
      { 'heldSeats.heldUntil': { $lt: now } },
      { $pull: { heldSeats: { heldUntil: { $lt: now } } } }
    );
  } catch (e) {
    console.error('Seat hold cleanup cron error:', e.message);
  }
});

app.listen(PORT, () => {
  console.log(`BusGo API listening on port ${PORT}`);
});
