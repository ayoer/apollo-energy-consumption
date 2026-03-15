import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

export const selectOrganization = (state: RootState) => state.organization;

export const organizationSelector = createSelector(selectOrganization, (state) => state);
