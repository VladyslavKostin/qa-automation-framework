import { describe, expect, it } from 'vitest';
import type { Page } from '@playwright/test';
import { BasePage } from '@core/pages/BasePage';
import { PageObjectFactory } from '@core/pages/PageObjectFactory';

class DummyPage extends BasePage {
  readonly title = this.elements.text({ selector: '#title', description: 'Page title banner' });
}

function makeFakePage(): Page {
  return {
    locator: () => ({ innerText: async () => 'hello' }),
    goto: async () => undefined,
  } as unknown as Page;
}

describe('PageObjectFactory', () => {
  it('constructs a page object bound to the given page, with working elements', async () => {
    const page = makeFakePage();
    const factory = new PageObjectFactory(page);

    const dummy = factory.create(DummyPage);

    expect(dummy.title.description).toBe('Page title banner');
    await expect(dummy.title.getText()).resolves.toBe('hello');
  });
});
