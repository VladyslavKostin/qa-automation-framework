import type { Page } from '@playwright/test';
import type { ElementDescriptor } from '@core/elements/Element';

export interface HealRequest {
  readonly page: Page;
  readonly descriptor: ElementDescriptor;
  readonly error: unknown;
}

export interface HealResult {
  readonly selector: string;
  readonly reason: string;
}

/**
 * Contract `BaseElement` depends on (Dependency Inversion) so the framework core never imports
 * the concrete agent implementation. `NoopHealer` and the real `AgentLocatorHealer` both live
 * outside this file and are wired in via `ElementFactory`.
 */
export interface LocatorHealer {
  heal(request: HealRequest): Promise<HealResult | undefined>;
}
