import { configureStore } from '@reduxjs/toolkit';
import { AuthReducer } from './auth';
import { OrganizationReducer } from './organization';
import { UserReducer } from './user';
import { MeterReducer } from './meter';
import { ReportReducer } from './report';
import spinnerReducer from './spinner';

export const store = configureStore({
  reducer: {
    auth: AuthReducer,
    organization: OrganizationReducer,
    user: UserReducer,
    meter: MeterReducer,
    report: ReportReducer,
    spinner: spinnerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
