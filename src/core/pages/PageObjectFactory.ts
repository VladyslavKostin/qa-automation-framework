import type { Page } from '@playwright/test';
import type { LocatorHealer } from '@core/healing/LocatorHealer';
import type { BasePage } from './BasePage';

type PageObjectConstructor<T extends BasePage> = new (page: Page, healer?: LocatorHealer) => T;

/**
 * Constructs page objects bound to a single `page`/`healer` pair (Factory pattern), so tests
 * depend on this factory rather than `new`-ing concrete page objects and repeating the wiring.
 */
export class PageObjectFactory {
  constructor(
    private readonly page: Page,
    private readonly healer?: LocatorHealer,
  ) {}

  create<T extends BasePage>(PageObject: PageObjectConstructor<T>): T {
    return new PageObject(this.page, this.healer);
  }
}
