export interface ApiResponse<T> {
  readonly status: number;
  readonly data: T;
}

/** Interface every API test and every agent-facing tool depends on, never the concrete client. */
export interface ApiClient {
  get<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>>;
}
