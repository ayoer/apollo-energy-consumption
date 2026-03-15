import { createReducer } from '@reduxjs/toolkit';
import { fetchMeters, createMeter, deleteMeter } from './actions';
import type { Meter } from '../../types';

interface MeterState {
  meters: Meter[];
  loading: boolean;
}

const initialState: MeterState = {
  meters: [],
  loading: false,
};

export const MeterReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchMeters.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchMeters.fulfilled, (state, action) => {
      state.loading = false;
      state.meters = action.payload || [];
    })
    .addCase(fetchMeters.rejected, (state) => {
      state.loading = false;
    })
    .addCase(createMeter.fulfilled, (state, action) => {
      if (action.payload) {
        state.meters.unshift(action.payload);
      }
    })
    .addCase(deleteMeter.fulfilled, (state, action) => {
      if (action.payload) {
        state.meters = state.meters.filter((m) => m.id !== action.payload);
      }
    });
});
