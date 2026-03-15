import { createAsyncThunk } from '@reduxjs/toolkit';
import { ActionTypes } from './action-types';
import { IActionCallback } from '../types';
import { apiURL, axiosClient } from '../../service';
import { setSpinner } from '../spinner';
import { notifyError } from '../../helpers/notify';

export const fetchMeters = createAsyncThunk(
  ActionTypes.FETCH_METERS,
  async (data: IActionCallback, { dispatch, rejectWithValue }) => {
    const { onSuccess, onError } = data;

    try {
      dispatch(setSpinner(true));
      const response = await axiosClient.get(apiURL.meters);
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

interface ICreateMeter extends IActionCallback {
  name: string;
  organizationId: string;
}

export const createMeter = createAsyncThunk(
  ActionTypes.CREATE_METER,
  async (data: ICreateMeter, { dispatch, rejectWithValue }) => {
    const { onSuccess, onError, ...payload } = data;

    try {
      dispatch(setSpinner(true));
      const response = await axiosClient.post(apiURL.meters, payload);
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

interface IDeleteMeter extends IActionCallback {
  id: string;
}

export const deleteMeter = createAsyncThunk(
  ActionTypes.DELETE_METER,
  async (data: IDeleteMeter, { dispatch, rejectWithValue }) => {
    const { id, onSuccess, onError } = data;

    try {
      dispatch(setSpinner(true));
      await axiosClient.delete(`${apiURL.meters}/${id}`);
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

interface IAssignMeter extends IActionCallback {
  meterId: string;
  userId: string;
}

export const assignMeter = createAsyncThunk(
  ActionTypes.ASSIGN_METER,
  async (data: IAssignMeter, { dispatch, rejectWithValue }) => {
    const { meterId, userId, onSuccess, onError } = data;

    try {
      dispatch(setSpinner(true));
      await axiosClient.post(`${apiURL.meters}/${meterId}/assign/${userId}`);
      if (onSuccess) onSuccess();
    } catch (error) {
      notifyError(error);
      if (onError) onError(error);
      return rejectWithValue(error);
    } finally {
      dispatch(setSpinner(false));
    }
  }
);

interface IUnassignMeter extends IActionCallback {
  meterId: string;
  userId: string;
}

export const unassignMeter = createAsyncThunk(
  ActionTypes.UNASSIGN_METER,
  async (data: IUnassignMeter, { dispatch, rejectWithValue }) => {
    const { meterId, userId, onSuccess, onError } = data;

    try {
      dispatch(setSpinner(true));
      await axiosClient.delete(`${apiURL.meters}/${meterId}/unassign/${userId}`);
      if (onSuccess) onSuccess();
    } catch (error) {
      notifyError(error);
      if (onError) onError(error);
      return rejectWithValue(error);
    } finally {
      dispatch(setSpinner(false));
    }
  }
);
