import api from './axiosInstance';

export const createBooking = (body) => api.post('/bookings', body);
export const validateCoupon = (code, totalFare) =>
  api.post('/bookings/validate-coupon', { code, totalFare });
export const myBookings = (params) => api.get('/bookings/my', { params });
export const getBooking = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id, reason) =>
  api.post(`/bookings/${id}/cancel`, { reason });
export const createPaymentOrder = (bookingId, amount) =>
  api.post('/payments/create-order', { bookingId, amount });
export const verifyPayment = (body) => api.post('/payments/verify', body);
export const payWithWallet = (bookingId) => api.post('/payments/pay-with-wallet', { bookingId });
