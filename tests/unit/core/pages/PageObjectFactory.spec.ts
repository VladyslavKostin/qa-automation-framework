import { describe, expect, it } from 'vitest';
import type { Page } from '@playwright/test';
import { BasePage } from '@core/pages/BasePage';
import { PageObjectFactory } from '@core/pages/PageObjectFactory';
import { Text } from '@core/elements/Text';

class DummyPage extends BasePage {
  readonly urlPath = '/dummy.html';
  readonly title = new Text(this.page, { selector: '#title', description: 'Page title banner' }, this.healer);
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

    expect(dummy.urlPath).toBe('/dummy.html');
    expect(dummy.title.description).toBe('Page title banner');
    await expect(dummy.title.getText()).resolves.toBe('hello');
  });
});
