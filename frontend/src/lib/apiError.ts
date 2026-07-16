import { isAxiosError } from 'axios';

export function getErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string' && detail.length > 0) return detail;
    if (!err.response) return "Can't reach the server. Check your connection and try again.";
    return 'Something went wrong on our end. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}
