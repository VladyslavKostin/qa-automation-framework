import { describe, expect, it } from 'vitest';
import { loadConfig } from '@core/config/AppConfig';

describe('loadConfig', () => {
  it('falls back to sane defaults when no env vars are set', () => {
    const config = loadConfig({});

    expect(config.ui.baseUrl).toBe('https://www.saucedemo.com');
    expect(config.api.baseUrl).toBe('https://jsonplaceholder.typicode.com');
    expect(config.llm.provider).toBe('mock');
    expect(config.llm.apiKey).toBeUndefined();
    expect(config.healing.enabled).toBe(true);
  });

  it('selects the anthropic provider automatically when an API key is present', () => {
    const config = loadConfig({ ANTHROPIC_API_KEY: 'sk-test-123' });

    expect(config.llm.provider).toBe('anthropic');
    expect(config.llm.apiKey).toBe('sk-test-123');
  });

  it('lets LLM_PROVIDER override the key-based default', () => {
    const config = loadConfig({ ANTHROPIC_API_KEY: 'sk-test-123', LLM_PROVIDER: 'mock' });

    expect(config.llm.provider).toBe('mock');
  });

  it('reads overrides for UI/API base URLs and disables healing when asked', () => {
    const config = loadConfig({
      UI_BASE_URL: 'https://example.test',
      API_BASE_URL: 'https://api.example.test',
      SELF_HEALING_ENABLED: 'false',
    });

    expect(config.ui.baseUrl).toBe('https://example.test');
    expect(config.api.baseUrl).toBe('https://api.example.test');
    expect(config.healing.enabled).toBe(false);
  });
});
