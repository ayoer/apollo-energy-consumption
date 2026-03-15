import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

export const selectMeter = (state: RootState) => state.meter;

export const meterSelector = createSelector(selectMeter, (state) => state);
