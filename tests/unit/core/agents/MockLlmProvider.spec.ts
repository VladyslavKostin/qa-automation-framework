import { describe, expect, it } from 'vitest';
import { MockLlmProvider } from '@core/agents/MockLlmProvider';

function promptFor(description: string, candidates: unknown[]): string {
  return [
    `The element described as "${description}" could not be found using the selector "#old".`,
    'Error: locator not found',
    'Candidate elements currently on the page (JSON):',
    JSON.stringify(candidates, null, 2),
    'Reply with strict JSON: {"selector": "...", "reason": "..."}.',
  ].join('\n\n');
}

describe('MockLlmProvider', () => {
  it('picks the candidate with the highest keyword overlap against the description', async () => {
    const candidates = [
      { tag: 'button', selector: '#checkout', text: 'Checkout', attributes: {} },
      {
        tag: 'button',
        selector: '[data-test="add-to-cart-backpack"]',
        text: 'Add to cart',
        attributes: { 'aria-label': 'Add Sauce Labs Backpack to cart' },
      },
    ];
    const prompt = promptFor('Add to cart button for the Sauce Labs Backpack card', candidates);

    const provider = new MockLlmProvider();
    const raw = await provider.complete([{ role: 'user', content: prompt }]);
    const parsed = JSON.parse(raw);

    expect(parsed.selector).toBe('[data-test="add-to-cart-backpack"]');
  });

  it('returns a null selector when nothing overlaps the description', async () => {
    const candidates = [{ tag: 'a', selector: '#footer-link', text: 'Twitter', attributes: {} }];
    const prompt = promptFor('Submit payment button', candidates);

    const provider = new MockLlmProvider();
    const raw = await provider.complete([{ role: 'user', content: prompt }]);
    const parsed = JSON.parse(raw);

    expect(parsed.selector).toBeNull();
  });

  it('returns a null selector when there are no candidates at all', async () => {
    const prompt = promptFor('Submit payment button', []);

    const provider = new MockLlmProvider();
    const raw = await provider.complete([{ role: 'user', content: prompt }]);
    const parsed = JSON.parse(raw);

    expect(parsed.selector).toBeNull();
  });
});
