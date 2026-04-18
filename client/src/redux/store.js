import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import searchReducer from '../features/search/searchSlice';
import bookingReducer from '../features/booking/bookingSlice';

// ── Persist auth to localStorage ──────────────────────────────────────────
const AUTH_KEY = 'busgo_auth';

function loadAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function saveAuth(state) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(state.auth));
  } catch {
    /* ignore */
  }
}

const preloadedState = {
  auth: loadAuth(),
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    search: searchReducer,
    booking: bookingReducer,
  },
  preloadedState,
});

// Persist auth slice after every dispatch
store.subscribe(() => {
  saveAuth(store.getState());
});
