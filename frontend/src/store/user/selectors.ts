import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

export const selectUser = (state: RootState) => state.user;

export const userSelector = createSelector(selectUser, (state) => state);
