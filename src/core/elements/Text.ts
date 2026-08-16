import { BaseElement } from './BaseElement';

/** Read-only text content — labels, badges, item names, prices. */
export class Text extends BaseElement {
  async getText(): Promise<string> {
    return this.perform((locator) => locator.innerText());
  }

  async isVisible(): Promise<boolean> {
    return this.perform((locator) => locator.isVisible());
  }
}
