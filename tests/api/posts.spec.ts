import { test, expect } from '@core/fixtures/test';
import { assertHasNonEmptyFields } from '@core/api/schema';
import type { Post } from '@entities/Post';

test.describe('jsonplaceholder — posts', () => {
  test('GET /posts/1 returns the expected contract', async ({ apiClient }) => {
    const response = await apiClient.get<Post>('/posts/1');

    expect(response.status).toBe(200);
    expect(response.data.id).toBe(1);
    assertHasNonEmptyFields(response.data as unknown as Record<string, unknown>, [
      'id',
      'userId',
      'title',
      'body',
    ]);
  });
});
