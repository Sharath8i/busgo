import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedTrip: null,
  selectedSeats: [],
  passengers: [],
  coupon: null,
  totalFare: 0,
  breakdown: null,
  currentBookingId: null,
  pnr: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    selectTrip: (state, action) => {
      state.selectedTrip = action.payload;
    },
    toggleSeat: (state, action) => {
      const seat = action.payload;
      const i = state.selectedSeats.indexOf(seat);
      if (i >= 0) state.selectedSeats.splice(i, 1);
      else state.selectedSeats.push(seat);
    },
    setSelectedSeats: (state, action) => {
      state.selectedSeats = action.payload;
    },
    setPassengers: (state, action) => {
      state.passengers = action.payload;
    },
    applyCoupon: (state, action) => {
      state.coupon = action.payload;
    },
    setPricing: (state, action) => {
      state.totalFare = action.payload.totalFare ?? 0;
      state.breakdown = action.payload.breakdown ?? null;
    },
    setCurrentBooking: (state, action) => {
      state.currentBookingId = action.payload.bookingId ?? null;
      state.pnr = action.payload.pnr ?? null;
    },
    resetBooking: () => ({ ...initialState }),
  },
});

export const {
  selectTrip,
  toggleSeat,
  setSelectedSeats,
  setPassengers,
  applyCoupon,
  setPricing,
  setCurrentBooking,
  resetBooking,
} = bookingSlice.actions;
export default bookingSlice.reducer;
