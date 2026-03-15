import { createReducer } from '@reduxjs/toolkit';
import { login, logout } from './actions';
import type { AuthUser } from '../../types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');

const initialState: AuthState = {
  token,
  user: userStr ? JSON.parse(userStr) : null,
  isAuthenticated: !!token,
};

export const AuthReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(login.fulfilled, (state, action) => {
      if (action.payload) {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      }
    })
    .addCase(logout, (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    });
});
