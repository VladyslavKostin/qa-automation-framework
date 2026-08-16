import type { Locator, Page } from '@playwright/test';
import type { Element, ElementDescriptor } from './Element';
import type { LocatorHealer } from '@core/healing/LocatorHealer';

/**
 * Template for every element type (Button, Input, Dropdown, ...). Concrete subclasses only add
 * the interactions that make sense for them (`click`, `fill`, `selectOption`, ...); the
 * find-it-and-retry-with-healing behaviour lives here exactly once.
 */
export abstract class BaseElement implements Element {
  private currentSelector: string;

  constructor(
    protected readonly page: Page,
    protected readonly descriptor: ElementDescriptor,
    private readonly healer?: LocatorHealer,
  ) {
    this.currentSelector = descriptor.selector;
  }

  get description(): string {
    return this.descriptor.description;
  }

  get selector(): string {
    return this.currentSelector;
  }

  resolve(): Locator {
    return this.page.locator(this.currentSelector);
  }

  /**
   * Runs `action` against the current locator. If it throws and a healer is wired in, asks the
   * healer for a replacement selector (using the original description, not the possibly-stale
   * one) and retries exactly once. A second failure propagates — healing is a single safety net,
   * not a retry loop.
   */
  protected async perform<T>(action: (locator: Locator) => Promise<T>): Promise<T> {
    try {
      return await action(this.resolve());
    } catch (error) {
      if (!this.healer) throw error;

      const healed = await this.healer.heal({
        page: this.page,
        descriptor: { selector: this.currentSelector, description: this.descriptor.description },
        error,
      });
      if (!healed) throw error;

      this.currentSelector = healed.selector;
      return action(this.resolve());
    }
  }
}
