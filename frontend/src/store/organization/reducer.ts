import { createReducer } from '@reduxjs/toolkit';
import { fetchOrganizations, createOrganization, deleteOrganization } from './actions';
import type { Organization } from '../../types';

interface OrganizationState {
  organizations: Organization[];
  loading: boolean;
}

const initialState: OrganizationState = {
  organizations: [],
  loading: false,
};

export const OrganizationReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchOrganizations.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchOrganizations.fulfilled, (state, action) => {
      state.loading = false;
      state.organizations = action.payload || [];
    })
    .addCase(fetchOrganizations.rejected, (state) => {
      state.loading = false;
    })
    .addCase(createOrganization.fulfilled, (state, action) => {
      if (action.payload) {
        state.organizations.unshift(action.payload);
      }
    })
    .addCase(deleteOrganization.fulfilled, (state, action) => {
      if (action.payload) {
        state.organizations = state.organizations.filter((o) => o.id !== action.payload);
      }
    });
});
