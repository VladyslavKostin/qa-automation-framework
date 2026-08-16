import type { Page } from '@playwright/test';
import type { CandidateElement } from './CandidateElement';

/**
 * Grabs a bounded snapshot of interactive elements from the live page so the healer can hand an
 * LLM something to reason over. Runs inside the browser (`page.evaluate`), so the callback body
 * must be self-contained — it cannot reference anything from this module's closure.
 */
export async function captureCandidates(page: Page, limit = 40): Promise<CandidateElement[]> {
  return page.evaluate((max) => {
    function computeSelector(el: Element): string {
      const testId = el.getAttribute('data-test') ?? el.getAttribute('data-testid');
      if (testId) return `[data-test="${testId}"], [data-testid="${testId}"]`;
      if (el.id) return `#${el.id}`;
      const name = el.getAttribute('name');
      if (name) return `${el.tagName.toLowerCase()}[name="${name}"]`;
      return el.tagName.toLowerCase();
    }

    const nodes = Array.from(
      document.querySelectorAll('button, a, input, select, textarea, [role], [data-test], [data-testid]'),
    ).slice(0, max);

    return nodes.map((el) => ({
      tag: el.tagName.toLowerCase(),
      selector: computeSelector(el),
      text: (el.textContent ?? '').trim().slice(0, 80),
      attributes: {
        id: el.getAttribute('id') ?? '',
        'data-test': el.getAttribute('data-test') ?? el.getAttribute('data-testid') ?? '',
        role: el.getAttribute('role') ?? '',
        'aria-label': el.getAttribute('aria-label') ?? '',
        name: el.getAttribute('name') ?? '',
        placeholder: el.getAttribute('placeholder') ?? '',
        type: el.getAttribute('type') ?? '',
      },
    }));
  }, limit);
}
