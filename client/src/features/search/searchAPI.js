import api from '../../api/axiosInstance';

export const fetchCities = (q) => api.get('/search/cities', { params: { q } });
export const fetchTripDetails = (tripId) => api.get(`/search/trips/${tripId}`);
export const fetchSeats = (tripId) => api.get(`/search/trips/${tripId}/seats`);
export const holdSeats = (tripId, seats) =>
  api.post(`/search/trips/${tripId}/hold-seats`, { seats });
export const releaseSeats = (tripId, seats) =>
  api.delete(`/search/trips/${tripId}/release-seats`, { data: { seats } });
