import { test as base, expect } from '@playwright/test';
import { loadConfig } from '@core/config/AppConfig';
import { PageObjectFactory } from '@core/pages/PageObjectFactory';
import { AgentLocatorHealer } from '@core/healing/AgentLocatorHealer';
import { createLlmProvider } from '@core/agents/LlmProviderFactory';
import { FetchApiClient } from '@core/api/FetchApiClient';
import type { ApiClient } from '@core/api/ApiClient';
import type { LocatorHealer } from '@core/healing/LocatorHealer';

export const config = loadConfig();

interface Fixtures {
  pages: PageObjectFactory;
  apiClient: ApiClient;
}

/**
 * The one place a test file needs to import from. Wires the healer (mock-backed unless
 * ANTHROPIC_API_KEY is set, disable entirely with SELF_HEALING_ENABLED=false) into every page
 * object it hands out, and provides a plain ApiClient for API specs.
 */
export const test = base.extend<Fixtures>({
  pages: async ({ page }, use) => {
    const healer: LocatorHealer | undefined = config.healing.enabled
      ? new AgentLocatorHealer(createLlmProvider(config.llm))
      : undefined;
    await use(new PageObjectFactory(page, healer));
  },
  apiClient: async (_fixtures, use) => {
    await use(new FetchApiClient(config.api.baseUrl));
  },
});

export { expect };
