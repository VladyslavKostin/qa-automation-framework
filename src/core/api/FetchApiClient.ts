import type { ApiClient, ApiResponse } from './ApiClient';

/**
 * Uses Node's built-in `fetch` rather than Playwright's `APIRequestContext` so `ApiClient` stays
 * usable outside a Playwright worker (e.g. from unit tests or the orchestrator agents) without
 * dragging a browser context along.
 */
export class FetchApiClient implements ApiClient {
  constructor(private readonly baseUrl: string) {}

  async get<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(new URL(path, this.baseUrl), init);
    const data = (await response.json()) as T;
    return { status: response.status, data };
  }
}
