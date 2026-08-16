import type { Locator } from '@playwright/test';

/**
 * Everything needed to find an element AND explain, in plain language, where it lives on the
 * page. The `description` is not cosmetic — it's the payload the self-healing agent sends to the
 * LLM when `selector` stops matching anything, so it needs to be specific enough for a human (or
 * a model) to relocate the element from a DOM snapshot alone.
 */
export interface ElementDescriptor {
  readonly selector: string;
  readonly description: string;
}

export interface Element {
  readonly description: string;
  resolve(): Locator;
}
