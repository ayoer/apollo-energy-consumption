import { message } from 'antd';
import axios from 'axios';

export function notifyError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message || 'An error occurred';
    message.error(msg);
  } else if (error instanceof Error) {
    message.error(error.message);
  } else {
    message.error('An unexpected error occurred');
  }
}

export function notifySuccess(msg: string) {
  message.success(msg);
}
