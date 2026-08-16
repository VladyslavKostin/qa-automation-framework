import type { Page } from '@playwright/test';
import type { LocatorHealer } from '@core/healing/LocatorHealer';

/**
 * Every page object extends this. Elements are typed classes (`Button`, `Input`, ...)
 * instantiated directly in the page object — `new Button(this.page, { selector, description },
 * this.healer)` — rather than built through a factory, so a page object's element declarations
 * read as plain, typed fields.
 */
export abstract class BasePage {
  /** Path (relative to the configured base URL) this page lives at — enables direct navigation. */
  abstract readonly urlPath: string;

  constructor(
    protected readonly page: Page,
    protected readonly healer?: LocatorHealer,
  ) {}

  /** Navigates straight to this page's own `urlPath`. */
  async open(): Promise<void> {
    await this.page.goto(this.urlPath);
  }
}
