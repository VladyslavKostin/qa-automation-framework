import { describe, expect, it, vi } from 'vitest';
import type { Page } from '@playwright/test';
import { AgentLocatorHealer } from '@core/healing/AgentLocatorHealer';
import type { LlmProvider } from '@core/agents/LlmProvider';

function fakePageWithCandidates(candidates: unknown[]): Page {
  return {
    evaluate: async () => candidates,
  } as unknown as Page;
}

describe('AgentLocatorHealer', () => {
  it('returns undefined without calling the provider when there are no candidates on the page', async () => {
    const provider: LlmProvider = { complete: vi.fn() };
    const healer = new AgentLocatorHealer(provider);

    const result = await healer.heal({
      page: fakePageWithCandidates([]),
      descriptor: { selector: '#old', description: 'Submit button' },
      error: new Error('not found'),
    });

    expect(result).toBeUndefined();
    expect(provider.complete).not.toHaveBeenCalled();
  });

  it('returns the selector and reason the provider proposes', async () => {
    const provider: LlmProvider = {
      complete: vi.fn().mockResolvedValue(JSON.stringify({ selector: '#new', reason: 'moved into footer' })),
    };
    const healer = new AgentLocatorHealer(provider);

    const result = await healer.heal({
      page: fakePageWithCandidates([{ tag: 'button', selector: '#new', text: 'Submit', attributes: {} }]),
      descriptor: { selector: '#old', description: 'Submit button' },
      error: new Error('not found'),
    });

    expect(result).toEqual({ selector: '#new', reason: 'moved into footer' });
  });

  it('returns undefined when the provider proposes no selector', async () => {
    const provider: LlmProvider = {
      complete: vi.fn().mockResolvedValue(JSON.stringify({ selector: null, reason: 'no match' })),
    };
    const healer = new AgentLocatorHealer(provider);

    const result = await healer.heal({
      page: fakePageWithCandidates([{ tag: 'a', selector: '#footer', text: 'Twitter', attributes: {} }]),
      descriptor: { selector: '#old', description: 'Submit button' },
      error: new Error('not found'),
    });

    expect(result).toBeUndefined();
  });

  it('returns undefined when the provider replies with invalid JSON', async () => {
    const provider: LlmProvider = { complete: vi.fn().mockResolvedValue('not json') };
    const healer = new AgentLocatorHealer(provider);

    const result = await healer.heal({
      page: fakePageWithCandidates([{ tag: 'a', selector: '#footer', text: 'Twitter', attributes: {} }]),
      descriptor: { selector: '#old', description: 'Submit button' },
      error: new Error('not found'),
    });

    expect(result).toBeUndefined();
  });
});
