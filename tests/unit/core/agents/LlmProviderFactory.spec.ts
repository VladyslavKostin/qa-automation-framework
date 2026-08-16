import { describe, expect, it } from 'vitest';
import { createLlmProvider } from '@core/agents/LlmProviderFactory';
import { MockLlmProvider } from '@core/agents/MockLlmProvider';
import { AnthropicLlmProvider } from '@core/agents/AnthropicLlmProvider';

describe('createLlmProvider', () => {
  it('returns a MockLlmProvider when the provider is "mock"', () => {
    const provider = createLlmProvider({ provider: 'mock', apiKey: undefined, model: 'claude-sonnet-4-5' });
    expect(provider).toBeInstanceOf(MockLlmProvider);
  });

  it('returns an AnthropicLlmProvider when the provider is "anthropic" and a key is present', () => {
    const provider = createLlmProvider({
      provider: 'anthropic',
      apiKey: 'sk-test',
      model: 'claude-sonnet-4-5',
    });
    expect(provider).toBeInstanceOf(AnthropicLlmProvider);
  });

  it('throws when "anthropic" is requested without an API key', () => {
    expect(() =>
      createLlmProvider({ provider: 'anthropic', apiKey: undefined, model: 'claude-sonnet-4-5' }),
    ).toThrow(/ANTHROPIC_API_KEY/);
  });
});
