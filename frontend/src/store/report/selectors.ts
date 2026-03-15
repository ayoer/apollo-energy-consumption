import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

export const selectReport = (state: RootState) => state.report;

export const reportSelector = createSelector(selectReport, (state) => state);
