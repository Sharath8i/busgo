import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

const initialState = {
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
  tempEmail: null, // For OTP verification step
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Login failed');
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', body);
      return { ...data, email: body.email };
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Register failed');
    }
  }
);

export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const refreshTokenThunk = createAsyncThunk('auth/refresh', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/refresh-token');
    return data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Session expired');
  }
});

export const updateProfileThunk = createAsyncThunk(
  'auth/updateProfile',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/auth/profile', body);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user ?? null;
      state.accessToken = action.payload.accessToken ?? null;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.tempEmail = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setTempEmail: (state, action) => {
      state.tempEmail = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.tempEmail = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tempEmail = action.payload.email;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOtpThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.tempEmail = null;
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Refresh
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
      })
      // Update Profile
      .addCase(updateProfileThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setCredentials, logout, clearError, setTempEmail } = authSlice.actions;
export default authSlice.reducer;
