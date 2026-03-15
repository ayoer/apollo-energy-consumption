import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ActionTypes } from './action-types';
import { IActionCallback } from '../types';
import { apiURL, axiosClient } from '../../service';
import { setSpinner } from '../spinner';
import { notifyError } from '../../helpers/notify';

interface ILogin extends IActionCallback {
  email: string;
  password: string;
}

export const login = createAsyncThunk(
  ActionTypes.LOGIN,
  async (data: ILogin, { dispatch, rejectWithValue }) => {
    const { email, password, onSuccess, onError } = data;

    try {
      dispatch(setSpinner(true));
      const response = await axiosClient.post(apiURL.login, { email, password });
      const result = response.data.data;
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      if (onSuccess) onSuccess(result);
      return result;
    } catch (error) {
      notifyError(error);
      if (onError) onError(error);
      return rejectWithValue(error);
    } finally {
      dispatch(setSpinner(false));
    }
  }
);

export const logout = createAction(ActionTypes.LOGOUT, () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return { payload: undefined };
});
