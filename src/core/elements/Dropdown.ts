import { BaseElement } from './BaseElement';

export class Dropdown extends BaseElement {
  async selectByValue(value: string): Promise<void> {
    await this.perform((locator) => locator.selectOption({ value }));
  }

  async selectByLabel(label: string): Promise<void> {
    await this.perform((locator) => locator.selectOption({ label }));
  }

  async getSelectedValue(): Promise<string> {
    return this.perform((locator) => locator.inputValue());
  }
}
