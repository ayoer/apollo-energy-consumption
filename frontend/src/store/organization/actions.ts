import { createAsyncThunk } from '@reduxjs/toolkit';
import { ActionTypes } from './action-types';
import { IActionCallback } from '../types';
import { apiURL, axiosClient } from '../../service';
import { setSpinner } from '../spinner';
import { notifyError } from '../../helpers/notify';

export const fetchOrganizations = createAsyncThunk(
  ActionTypes.FETCH_ORGANIZATIONS,
  async (data: IActionCallback, { dispatch, rejectWithValue }) => {
    const { onSuccess, onError } = data;

    try {
      dispatch(setSpinner(true));
      const response = await axiosClient.get(apiURL.organizations);
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

interface ICreateOrganization extends IActionCallback {
  name: string;
}

export const createOrganization = createAsyncThunk(
  ActionTypes.CREATE_ORGANIZATION,
  async (data: ICreateOrganization, { dispatch, rejectWithValue }) => {
    const { name, onSuccess, onError } = data;

    try {
      dispatch(setSpinner(true));
      const response = await axiosClient.post(apiURL.organizations, { name });
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

interface IDeleteOrganization extends IActionCallback {
  id: string;
}

export const deleteOrganization = createAsyncThunk(
  ActionTypes.DELETE_ORGANIZATION,
  async (data: IDeleteOrganization, { dispatch, rejectWithValue }) => {
    const { id, onSuccess, onError } = data;

    try {
      dispatch(setSpinner(true));
      await axiosClient.delete(`${apiURL.organizations}/${id}`);
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
