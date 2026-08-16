import { describe, expect, it, vi } from 'vitest';
import type { LlmProvider } from '@core/agents/LlmProvider';
import { WriterAgent } from '../../../tools/orchestrator/WriterAgent';
import type { TestPlan } from '../../../tools/orchestrator/types';

const plan: TestPlan = {
  title: 'Remove an item from the cart',
  pageObjectName: 'CartPage',
  steps: ['Open the cart', 'Click remove on the first item'],
  assertions: ['The item list is empty'],
};

describe('WriterAgent', () => {
  it('uses the provider-authored content when it mentions the page object class', async () => {
    const content = "test('x', async () => { /* uses CartPage */ });";
    const provider: LlmProvider = { complete: vi.fn().mockResolvedValue(JSON.stringify({ content })) };

    const result = await new WriterAgent(provider).write(plan, '@pages/generated/CartPage');

    expect(result).toBe(content);
  });

  it('falls back to a compilable skeleton importing the given page object path', async () => {
    const provider: LlmProvider = { complete: vi.fn().mockResolvedValue('not json') };

    const result = await new WriterAgent(provider).write(plan, '@pages/generated/CartPage');

    expect(result).toContain("import { CartPage } from '@pages/generated/CartPage';");
    expect(result).toContain("pages.create(CartPage)");
    expect(result).toContain('Open the cart');
  });
});
