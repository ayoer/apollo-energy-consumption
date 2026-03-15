import { createReducer } from '@reduxjs/toolkit';
import { fetchUsers, createUser, deleteUser } from './actions';
import type { User } from '../../types';

interface UserState {
  users: User[];
  loading: boolean;
}

const initialState: UserState = {
  users: [],
  loading: false,
};

export const UserReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchUsers.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.users = action.payload || [];
    })
    .addCase(fetchUsers.rejected, (state) => {
      state.loading = false;
    })
    .addCase(createUser.fulfilled, (state, action) => {
      if (action.payload) {
        state.users.unshift(action.payload);
      }
    })
    .addCase(deleteUser.fulfilled, (state, action) => {
      if (action.payload) {
        state.users = state.users.filter((u) => u.id !== action.payload);
      }
    });
});
