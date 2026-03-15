import { createReducer } from '@reduxjs/toolkit';
import { fetchReport } from './actions';
import type { ReportData } from '../../types';

interface ReportState {
  reportData: ReportData[];
  loading: boolean;
}

const initialState: ReportState = {
  reportData: [],
  loading: false,
};

export const ReportReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchReport.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchReport.fulfilled, (state, action) => {
      state.loading = false;
      state.reportData = action.payload || [];
    })
    .addCase(fetchReport.rejected, (state) => {
      state.loading = false;
    });
});
