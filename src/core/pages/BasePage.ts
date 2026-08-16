import type { Page } from '@playwright/test';
import { ElementFactory } from '@core/elements/ElementFactory';
import type { LocatorHealer } from '@core/healing/LocatorHealer';

/**
 * Every page object extends this. It owns nothing but an `ElementFactory` bound to the current
 * page (and, if configured, the healer) — concrete pages declare their elements as readonly
 * fields built from `this.elements`, and their behaviour as methods that compose those elements.
 */
export abstract class BasePage {
  protected readonly elements: ElementFactory;

  constructor(
    protected readonly page: Page,
    healer?: LocatorHealer,
  ) {
    this.elements = new ElementFactory(page, healer);
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }
}
