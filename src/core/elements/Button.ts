import { BaseElement } from './BaseElement';

export class Button extends BaseElement {
  async click(): Promise<void> {
    await this.perform((locator) => locator.click());
  }

  async isEnabled(): Promise<boolean> {
    return this.perform((locator) => locator.isEnabled());
  }
}
