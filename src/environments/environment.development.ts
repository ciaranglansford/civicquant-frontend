import { AppEnvironment } from './app-environment';

export const environment: AppEnvironment = {
  production: false,
  apiBaseUrl: '',
  feedPollingMs: 60_000,
  feedPageSize: 30,
  feedMockEnabled: false,
};

