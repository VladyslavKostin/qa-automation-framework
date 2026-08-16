import { BaseElement } from './BaseElement';

export class Link extends BaseElement {
  async click(): Promise<void> {
    await this.perform((locator) => locator.click());
  }

  async getHref(): Promise<string | null> {
    return this.perform((locator) => locator.getAttribute('href'));
  }

  async getText(): Promise<string> {
    return this.perform((locator) => locator.innerText());
  }
}
