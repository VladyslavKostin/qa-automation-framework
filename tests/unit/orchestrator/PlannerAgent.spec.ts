import { describe, expect, it, vi } from 'vitest';
import type { LlmProvider } from '@core/agents/LlmProvider';
import { MockLlmProvider } from '@core/agents/MockLlmProvider';
import { PlannerAgent } from '../../../tools/orchestrator/PlannerAgent';

describe('PlannerAgent', () => {
  it('parses a well-formed plan from the provider', async () => {
    const provider: LlmProvider = {
      complete: vi.fn().mockResolvedValue(
        JSON.stringify({
          title: 'Remove an item from the cart',
          pageObjectName: 'CartPage',
          steps: ['Open the cart', 'Click remove on the first item'],
          assertions: ['The item list is empty'],
        }),
      ),
    };

    const plan = await new PlannerAgent(provider).plan('remove an item from the cart');

    expect(plan.pageObjectName).toBe('CartPage');
    expect(plan.steps).toHaveLength(2);
  });

  it('falls back to a deterministic plan when the provider reply is malformed', async () => {
    const provider: LlmProvider = { complete: vi.fn().mockResolvedValue('not json at all') };

    const plan = await new PlannerAgent(provider).plan('remove an item from the cart');

    expect(plan.title).toBe('remove an item from the cart');
    expect(plan.pageObjectName).toBe('RemoveAnItemFromTheCartPage');
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.assertions.length).toBeGreaterThan(0);
  });

  it('falls back to the same deterministic plan when run offline against the real MockLlmProvider', async () => {
    const plan = await new PlannerAgent(new MockLlmProvider()).plan('remove an item from the cart');

    expect(plan.pageObjectName).toBe('RemoveAnItemFromTheCartPage');
  });
});
