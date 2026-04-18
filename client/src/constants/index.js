/**
 * Application-wide constants for BusGo.
 */

export const APP_NAME = 'BusGo';
export const APP_TAGLINE = 'Experience the next generation of travel.';

export const ROLES = {
  PASSENGER: 'passenger',
  OPERATOR: 'operator',
  ADMIN: 'admin',
};

export const BUS_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'volvo', label: 'Volvo A/C' },
  { value: 'sleeper', label: 'Sleeper' },
  { value: 'semi_sleeper', label: 'Semi Sleeper' },
  { value: 'seater', label: 'Seater' },
];

export const AMENITIES = [
  'WiFi',
  'AC',
  'Charging Port',
  'Sleeping Berth',
  'Blanket',
  'Water Bottle',
  'Entertainment Screen',
  'Meals',
];

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};

export const SEAT_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  HELD: 'held',
};

export const SEAT_HOLD_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export const ID_PROOF_TYPES = [
  'Aadhaar',
  'PAN Card',
  'Passport',
  'Driving Licence',
  'Voter ID',
];

export const POPULAR_ROUTES = [
  { from: 'Chennai', to: 'Bangalore', duration: '6h 15m' },
  { from: 'Mumbai', to: 'Pune', duration: '3h 00m' },
  { from: 'Delhi', to: 'Agra', duration: '4h 30m' },
  { from: 'Hyderabad', to: 'Vijayawada', duration: '5h 00m' },
];

export const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'Other', label: 'Other' },
];
