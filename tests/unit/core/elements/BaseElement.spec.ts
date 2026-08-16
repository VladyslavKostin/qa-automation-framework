import { describe, expect, it, vi } from 'vitest';
import type { Page } from '@playwright/test';
import { Button } from '@core/elements/Button';
import type { LocatorHealer } from '@core/healing/LocatorHealer';

function makeLocator(overrides: Partial<{ click: () => Promise<void> }> = {}) {
  return {
    click: vi.fn(overrides.click ?? (() => Promise.resolve())),
  };
}

function makePage(locatorsBySelector: Record<string, ReturnType<typeof makeLocator>>) {
  return {
    locator: (selector: string) => {
      const locator = locatorsBySelector[selector];
      if (!locator) throw new Error(`no fake locator registered for ${selector}`);
      return locator;
    },
  } as unknown as Page;
}

describe('Button', () => {
  it('exposes the description it was built with', () => {
    const page = makePage({ '#submit': makeLocator() });
    const button = new Button(page, { selector: '#submit', description: 'Submit button in the footer' });

    expect(button.description).toBe('Submit button in the footer');
  });

  it('clicks the resolved locator', async () => {
    const locator = makeLocator();
    const page = makePage({ '#submit': locator });
    const button = new Button(page, { selector: '#submit', description: 'Submit button' });

    await button.click();

    expect(locator.click).toHaveBeenCalledTimes(1);
  });

  it('asks the healer for a replacement selector and retries exactly once on failure', async () => {
    const brokenLocator = makeLocator({ click: () => Promise.reject(new Error('not found')) });
    const healedLocator = makeLocator();
    const page = makePage({ '#old': brokenLocator, '#new': healedLocator });
    const healer: LocatorHealer = {
      heal: vi.fn().mockResolvedValue({ selector: '#new', reason: 'element moved' }),
    };

    const button = new Button(page, { selector: '#old', description: 'Submit button' }, healer);
    await button.click();

    expect(healer.heal).toHaveBeenCalledOnce();
    expect(healedLocator.click).toHaveBeenCalledTimes(1);
  });

  it('propagates the original error when the healer finds no replacement', async () => {
    const brokenLocator = makeLocator({ click: () => Promise.reject(new Error('not found')) });
    const page = makePage({ '#old': brokenLocator });
    const healer: LocatorHealer = { heal: vi.fn().mockResolvedValue(undefined) };
    const button = new Button(page, { selector: '#old', description: 'x' }, healer);

    await expect(button.click()).rejects.toThrow('not found');
  });

  it('propagates the original error when no healer is configured', async () => {
    const brokenLocator = makeLocator({ click: () => Promise.reject(new Error('not found')) });
    const page = makePage({ '#old': brokenLocator });
    const button = new Button(page, { selector: '#old', description: 'x' });

    await expect(button.click()).rejects.toThrow('not found');
  });
});
