import { AppEnvironment } from './app-environment';

export const environment: AppEnvironment = {
  production: true,
  apiBaseUrl: '',
  feedPollingMs: 60_000,
  feedPageSize: 30,
  feedMockEnabled: false,
};
