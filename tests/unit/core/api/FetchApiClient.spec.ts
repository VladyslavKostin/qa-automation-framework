import { afterEach, describe, expect, it, vi } from 'vitest';
import { FetchApiClient } from '@core/api/FetchApiClient';

describe('FetchApiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves the path against the base URL and returns status + parsed JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ id: 1, title: 'hello' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new FetchApiClient('https://api.example.test');
    const response = await client.get<{ id: number; title: string }>('/posts/1');

    expect(fetchMock).toHaveBeenCalledWith(new URL('/posts/1', 'https://api.example.test'), undefined);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ id: 1, title: 'hello' });
  });
});
