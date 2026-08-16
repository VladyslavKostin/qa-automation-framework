import { describe, expect, it, vi } from 'vitest';
import type { LlmProvider } from '@core/agents/LlmProvider';
import { PageObjectAgent } from '../../../tools/orchestrator/PageObjectAgent';
import type { TestPlan } from '../../../tools/orchestrator/types';

const plan: TestPlan = {
  title: 'Remove an item from the cart',
  pageObjectName: 'CartPage',
  steps: ['Open the cart', 'Click remove on the first item'],
  assertions: ['The item list is empty'],
};

describe('PageObjectAgent', () => {
  it('uses the provider-authored content when it mentions the page object class', async () => {
    const content = "export class CartPage extends BasePage { /* real content */ }";
    const provider: LlmProvider = { complete: vi.fn().mockResolvedValue(JSON.stringify({ content })) };

    const result = await new PageObjectAgent(provider).write(plan);

    expect(result).toBe(content);
  });

  it('falls back to a compilable skeleton when the provider reply is unusable', async () => {
    const provider: LlmProvider = { complete: vi.fn().mockResolvedValue('not json') };

    const result = await new PageObjectAgent(provider).write(plan);

    expect(result).toContain('export class CartPage extends BasePage');
    expect(result).toContain("from '@core/pages/BasePage'");
  });
});
