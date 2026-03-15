import { createAsyncThunk } from '@reduxjs/toolkit';
import { ActionTypes } from './action-types';
import { IActionCallback } from '../types';
import { apiURL, axiosClient } from '../../service';
import { setSpinner } from '../spinner';
import { notifyError } from '../../helpers/notify';

interface IFetchUserDetail extends IActionCallback {
  id: string;
}

export const fetchUserDetail = createAsyncThunk(
  ActionTypes.FETCH_USER_DETAIL,
  async (data: IFetchUserDetail, { dispatch, rejectWithValue }) => {
    const { id, onSuccess, onError } = data;

    try {
      dispatch(setSpinner(true));
      const response = await axiosClient.get(`${apiURL.users}/${id}`);
      const result = response.data.data;
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

export const fetchUsers = createAsyncThunk(
  ActionTypes.FETCH_USERS,
  async (data: IActionCallback, { dispatch, rejectWithValue }) => {
    const { onSuccess, onError } = data;

    try {
      dispatch(setSpinner(true));
      const response = await axiosClient.get(apiURL.users);
      const result = response.data.data;
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

interface ICreateUser extends IActionCallback {
  email: string;
  password: string;
  role: 'admin' | 'user';
  organizationId?: string;
}

export const createUser = createAsyncThunk(
  ActionTypes.CREATE_USER,
  async (data: ICreateUser, { dispatch, rejectWithValue }) => {
    const { onSuccess, onError, ...payload } = data;

    try {
      dispatch(setSpinner(true));
      const response = await axiosClient.post(apiURL.users, payload);
      const result = response.data.data;
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

interface IDeleteUser extends IActionCallback {
  id: string;
}

export const deleteUser = createAsyncThunk(
  ActionTypes.DELETE_USER,
  async (data: IDeleteUser, { dispatch, rejectWithValue }) => {
    const { id, onSuccess, onError } = data;

    try {
      dispatch(setSpinner(true));
      await axiosClient.delete(`${apiURL.users}/${id}`);
      if (onSuccess) onSuccess();
      return id;
    } catch (error) {
      notifyError(error);
      if (onError) onError(error);
      return rejectWithValue(error);
    } finally {
      dispatch(setSpinner(false));
    }
  }
);
