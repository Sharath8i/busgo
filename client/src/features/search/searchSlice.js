import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

const initialState = {
  from: '',
  to: '',
  date: '',
  seats: 1,
  results: [],
  isLoading: false,
  error: null,
};

export const fetchBusesThunk = createAsyncThunk(
  'search/fetchBuses',
  async ({ from, to, date, seats }, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/search/buses', {
        params: { from, to, date, seats },
      });
      return data.results;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Search failed');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchParams: (state, action) => {
      Object.assign(state, action.payload);
    },
    clearSearch: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload;
      })
      .addCase(fetchBusesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchParams, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
