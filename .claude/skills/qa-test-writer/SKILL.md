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
import { test, expect, config } from '@core/fixtures/test';
import { LoginPage } from '@pages/sauce-demo/LoginPage';
import { InventoryPage } from '@pages/sauce-demo/InventoryPage';

test.describe('SauceDemo — <feature>', () => {
  test('<one-line description matching the plan title>', async ({ page, pages }) => {
    const loginPage = pages.create(LoginPage);
    const inventoryPage = pages.create(InventoryPage);

    await test.step('Log in as a standard user', async () => {
      await loginPage.open();
      await loginPage.login(config.ui.username, config.ui.password);
      await expect(page).toHaveURL(/inventory\.html/);
    });

    await test.step('<next action from the plan, one step at a time>', async () => {
      // ...
    });
  });
});
```

- Import `test`/`expect`/`config` from `@core/fixtures/test'` — never from `@playwright/test`
  directly; the custom fixtures wire in the healer and `ApiClient`.
- Instantiate page objects through the `pages` fixture: `pages.create(SomePage)`. Never `new` a
  page object directly in a test.
- **One `test.step()` per action from the plan**, each with a short present-tense description
  (`'Add the backpack to the cart'`, not `'Test add to cart'`) — this is what makes the test read
  as a scenario, both in the source and in the Allure/Playwright HTML report.
- Prefer asserting on the element's own locator — `expect(someElement.resolve()).toHaveText(...)`
  — over calling `.getText()` and comparing manually; Playwright's `expect` auto-retries, a plain
  `await` does not.
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
  assertHasNonEmptyFields(response.data as unknown as Record<string, unknown>, ['id', 'userId', 'title', 'body']);
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
