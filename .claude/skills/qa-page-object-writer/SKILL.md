---
name: qa-page-object-writer
description: Writes or updates Playwright page objects for the qa-automation-framework repo's conventions (BasePage, urlPath, direct element instantiation). Use after qa-test-planner produces a plan that needs a new or changed page object, or whenever asked to add/update a page object in this framework directly.
---

# QA Page Object Writer

## Overview

Second stage of the qa-test-planner → **qa-page-object-writer** → qa-test-writer pipeline. Turns a
plan's "target page(s)" section into a real `src/pages/**` file, following this repo's
conventions exactly — a test-writer downstream depends on them being followed consistently.

## Before writing anything: look at the real page

Don't guess selectors. Use the Playwright MCP server (configured in `.mcp.json` at the repo root —
`npx @playwright/mcp@latest`, dev-time only) to open the actual target URL and read its real
`data-test` / `data-testid` attributes, the same way the existing SauceDemo page objects were
built. Prefer `data-test`/`data-testid` over CSS classes or text content — they're the most
change-resistant selector, and least likely to ever need the self-healing agent to kick in.

## Conventions

```ts
import { BasePage } from '@core/pages/BasePage';
import { Button } from '@core/elements/Button';
// Input, Dropdown, Checkbox, Link, Text also live under @core/elements/

export class ExamplePage extends BasePage {
  readonly urlPath = '/example.html'; // required — enables direct navigation via page.open()

  readonly submitButton = new Button(
    this.page,
    {
      selector: '[data-test="submit"]',
      description: 'Submit button at the bottom of the example form',
    },
    this.healer,
  );

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
```

- Extend `BasePage` and declare `readonly urlPath = '<path>'` — every page object must have one,
  even if nothing navigates to it directly yet.
- Elements are typed classes from `@core/elements/*` (`Button`, `Input`, `Dropdown`, `Checkbox`,
  `Link`, `Text`) instantiated **directly** as `new ElementType(this.page, { selector,
  description }, this.healer)` — there is no element factory in this framework. `this.page` and
  `this.healer` come from `BasePage`; always pass `this.healer` through so self-healing works.
- `description` is not cosmetic — it's what the self-healing agent sends an LLM when `selector`
  stops matching anything. Write it as if describing the element's location to someone who can't
  see the selector: what it is, and where it sits on the page.
- Put **behavior** (multi-element actions like `login()`, `fillAndContinue()`) as methods on the
  page object. Keep element declarations to state, not behavior.
- One page object per page/screen, under `src/pages/<feature>/`, PascalCase filename matching the
  exported class name.
- If a new entity type is needed for a method's parameter (e.g. a form's field set), it belongs in
  `src/entities/`, not inlined in the page object — see `CheckoutInfo` for the shape.

## Output

The new/updated `.ts` file under `src/pages/**`, plus a one-line note on which entity (if any) it
now depends on. Hand off to **qa-test-writer**.
