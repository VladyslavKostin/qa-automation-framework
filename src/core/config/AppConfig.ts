export type LlmProviderKind = 'mock' | 'anthropic';

export interface AppConfig {
  readonly ui: {
    readonly baseUrl: string;
    readonly username: string;
    readonly password: string;
  };
  readonly api: {
    readonly baseUrl: string;
  };
  readonly llm: {
    readonly provider: LlmProviderKind;
    readonly apiKey: string | undefined;
    readonly model: string;
  };
  readonly healing: {
    readonly enabled: boolean;
  };
}

function readEnv(env: NodeJS.ProcessEnv, name: string, fallback: string): string {
  const value = env[name];
  return value && value.length > 0 ? value : fallback;
}

function readBool(env: NodeJS.ProcessEnv, name: string, fallback: boolean): boolean {
  const value = env[name];
  if (value === undefined) return fallback;
  return value === '1' || value.toLowerCase() === 'true';
}

/**
 * Single source of truth for environment-derived configuration. Every consumer (Playwright
 * config, page objects, agents) reads through this instead of touching `process.env` directly,
 * so defaults live in exactly one place.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const apiKey = env.ANTHROPIC_API_KEY;
  const provider: LlmProviderKind = apiKey ? 'anthropic' : 'mock';

  return {
    ui: {
      baseUrl: readEnv(env, 'UI_BASE_URL', 'https://www.saucedemo.com'),
      username: readEnv(env, 'SAUCE_USERNAME', 'standard_user'),
      password: readEnv(env, 'SAUCE_PASSWORD', 'secret_sauce'),
    },
    api: {
      baseUrl: readEnv(env, 'API_BASE_URL', 'https://jsonplaceholder.typicode.com'),
    },
    llm: {
      provider: (env.LLM_PROVIDER as LlmProviderKind | undefined) ?? provider,
      apiKey,
      model: readEnv(env, 'LLM_MODEL', 'claude-sonnet-4-5'),
    },
    healing: {
      enabled: readBool(env, 'SELF_HEALING_ENABLED', true),
    },
  };
}
