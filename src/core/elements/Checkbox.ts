import { BaseElement } from './BaseElement';

export class Checkbox extends BaseElement {
  async check(): Promise<void> {
    await this.perform((locator) => locator.check());
  }

  async uncheck(): Promise<void> {
    await this.perform((locator) => locator.uncheck());
  }

  async isChecked(): Promise<boolean> {
    return this.perform((locator) => locator.isChecked());
  }
}
