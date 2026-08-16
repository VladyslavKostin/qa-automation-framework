import { BaseElement } from './BaseElement';

export class Input extends BaseElement {
  async fill(value: string): Promise<void> {
    await this.perform((locator) => locator.fill(value));
  }

  async clear(): Promise<void> {
    await this.perform((locator) => locator.clear());
  }

  async getValue(): Promise<string> {
    return this.perform((locator) => locator.inputValue());
  }
}
