---
name: qa-test-writer
description: Writes Playwright spec files for the qa-automation-framework repo's conventions — fixtures import, a readable chain of test.step() actions, entities and test-data builders. Use after qa-test-planner (and, if needed, qa-page-object-writer) to produce the final .spec.ts file, or whenever asked to write a test directly in this framework.
---

# QA Test Writer

## Overview

Final stage of the qa-test-planner → qa-page-object-writer → **qa-test-writer** pipeline. Turns a
plan (and whatever page objects now exist for it) into a `.spec.ts` file that reads as a plain
narrative of the scenario, step by step.

## Conventions

```ts
import { test, config } from '@core/fixtures/test';
import { SauceDemoFlows } from '@flows/sauce-demo/SauceDemoFlows';

test.describe('SauceDemo — <feature>', () => {
  test('<one-line description matching the plan title>', async ({ page, pages }) => {
    const flows = new SauceDemoFlows(page, pages);

    await flows.loginAsStandardUser(config.ui.username, config.ui.password);
    await flows.addBackpackToCart();
    // ...next action from the plan, reusing an existing flow method wherever one already
    // covers it, calling page-object methods directly only for the parts genuinely new to
    // this scenario.
  });
});
```

- Import `test`/`expect`/`config` from `@core/fixtures/test'` — never from `@playwright/test`
  directly; the custom fixtures wire in the healer and `ApiClient`.
- Instantiate page objects through the `pages` fixture: `pages.create(SomePage)`. Never `new` a
  page object directly in a test.
- **Reuse before you write.** Before adding a `test.step()` inline, check `src/flows/<feature>/`
  for a method that already covers it (e.g. `SauceDemoFlows.loginAsStandardUser`,
  `addBackpackToCart`). Call it instead of re-typing the step body.
- **Any step this scenario introduces that a future scenario would plausibly reuse belongs in a
  flow, not inline in the spec.** Add the method to the existing flow class for that feature (or
  create `src/flows/<feature>/<Feature>Flows.ts`, constructed as `(page, pages)`, if none exists
  yet) — one method per step, each wrapped in its own `test.step('<short present-tense
  description>', async () => { ... })`, e.g. `'Add the backpack to the cart'`, not `'Test add to
  cart'`. A step that's genuinely specific to only this one spec (unlikely to recur) can stay
  inline as a `test.step()` in the spec file itself.
- This is what makes the test read as a scenario, both in the source and in the Allure/Playwright
  HTML report, while keeping each step defined exactly once.
- Prefer asserting on the element's own locator — `expect(someElement.resolve()).toHaveText(...)`
  — over calling `.getText()` and comparing manually; Playwright's `expect` auto-retries, a plain
  `await` does not. (Flow methods already do this internally — a spec composing them usually
  doesn't need its own extra assertions.)
- For dynamic input data (names, addresses, anything that shouldn't be a hardcoded literal), use
  an existing builder from `src/testdata/` or add a new one (Builder pattern, faker-seeded
  defaults, `with*()` overrides, see `CheckoutInfoBuilder`) rather than inlining fake-looking
  literals.
- UI specs go in `tests/ui/`; API specs in `tests/api/`.

### API specs

```ts
import { test, expect } from '@core/fixtures/test';
import { assertHasNonEmptyFields } from '@core/api/schema';
import type { Post } from '@entities/Post';

test('GET /posts/1 returns the expected contract', async ({ apiClient }) => {
  const response = await apiClient.get<Post>('/posts/1');
  expect(response.status).toBe(200);
  assertHasNonEmptyFields(response.data, ['id', 'userId', 'title', 'body']);
});
```

- Response shapes are typed via an interface in `src/entities/` (add one if the resource doesn't
  have one yet) — never declare the interface inline in the spec file.
- Use `assertHasNonEmptyFields` from `@core/api/schema` for "key properties aren't empty/null/
  undefined" checks, matching what the Postman collection (`postman/collection.json`) asserts.

## Verify before calling it done

```bash
npm run typecheck
npx playwright test <the new spec file>
```

A generated spec that doesn't compile or doesn't pass against the real target isn't finished.
