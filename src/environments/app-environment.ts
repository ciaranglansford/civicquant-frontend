export interface AppEnvironment {
  production: boolean;
  apiBaseUrl: string;
  feedPollingMs: number;
  feedPageSize: number;
  feedMockEnabled: boolean;
}
