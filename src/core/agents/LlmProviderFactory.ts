import type { AppConfig } from '@core/config/AppConfig';
import type { LlmProvider } from './LlmProvider';
import { MockLlmProvider } from './MockLlmProvider';
import { AnthropicLlmProvider } from './AnthropicLlmProvider';

/** Chooses the concrete `LlmProvider` from config so nothing downstream ever calls `new` itself. */
export function createLlmProvider(config: AppConfig['llm']): LlmProvider {
  if (config.provider === 'anthropic') {
    if (!config.apiKey) {
      throw new Error('LLM_PROVIDER=anthropic requires ANTHROPIC_API_KEY to be set.');
    }
    return new AnthropicLlmProvider(config.apiKey, config.model);
  }
  return new MockLlmProvider();
}
