import { createAsyncThunk } from '@reduxjs/toolkit';
import { ActionTypes } from './action-types';
import { IActionCallback } from '../types';
import { apiURL, axiosClient } from '../../service';
import { setSpinner } from '../spinner';
import { notifyError } from '../../helpers/notify';

interface IFetchReport extends IActionCallback {
  meterIds?: string[];
}

export const fetchReport = createAsyncThunk(
  ActionTypes.FETCH_REPORT,
  async (data: IFetchReport, { dispatch, rejectWithValue }) => {
    const { onSuccess, onError, meterIds } = data;

    try {
      dispatch(setSpinner(true));
      const params = meterIds?.length ? { meterIds: meterIds.join(',') } : {};
      const response = await axiosClient.get(apiURL.report, { params });
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
