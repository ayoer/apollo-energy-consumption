import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SpinnerState {
  loading: boolean;
}

const initialState: SpinnerState = {
  loading: false,
};

const spinnerSlice = createSlice({
  name: 'spinner',
  initialState,
  reducers: {
    setSpinner(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setSpinner } = spinnerSlice.actions;
export default spinnerSlice.reducer;
