# Spec: QA Automation Framework

## Objective

A from-scratch TypeScript + Playwright test automation framework demonstrating SOLID/OOP
architecture, design patterns, and a self-healing locator agent layered on top of a conventional
POM framework:

- **UI test**: log in to https://www.saucedemo.com/, add an item to the cart, verify the cart,
  complete checkout with generated test data.
- **API test**: GET a resource from https://jsonplaceholder.typicode.com/, assert the response
  contract.
- **Self-healing locators**: when a locator fails, an agent uses the element's own description
  metadata + a DOM snapshot to propose a replacement selector, so a UI change doesn't necessarily
  fail the run.
- **Test generation**: not runtime code — a set of Claude Code skills
  (`.claude/skills/qa-test-planner`, `qa-page-object-writer`, `qa-test-writer`, `qa-generate-test`)
  that turn a plain-English scenario into a new Playwright spec + page object, following this
  repo's conventions.

Users: the Limestone Digital reviewers (grading against the brief), and — secondarily — this
repo as a personal portfolio piece on `VladyslavKostin`'s GitHub.

Success looks like: `npm test` runs the UI + API suites green, `npm run report` opens an Allure
report, the `qa-generate-test` skill produces a working draft spec when invoked in Claude Code,
and a locator that is deliberately broken in a demo still gets healed and passes (with a real
`ANTHROPIC_API_KEY`).

## Tech Stack

- TypeScript (strict mode), Node.js ≥18
- `@playwright/test` for UI + API tests
- `vitest` for unit-testing framework internals (element resolution, healing decision logic,
  test-data builders) — this is the TDD layer, isolated from live browser/network I/O
- `allure-playwright` + `allure-commandline` for reporting (Java is available in this
  environment and is required to generate the classic Allure HTML report)
- `@anthropic-ai/sdk` behind a provider interface — `AnthropicLlmProvider` (real) and
  `MockLlmProvider` (deterministic, no network) implement the same `LlmProvider` contract, used
  only by the self-healing agent
- `@faker-js/faker` for test-data builders
- `@playwright/mcp` config for editor-side agent tooling (dev-time only)
- ESLint + Prettier

## Commands

```
Install:          npm install && npx playwright install --with-deps chromium
Unit tests (TDD):  npm run test:unit
UI+API e2e tests:  npm test                     # both projects
Single test:       npx playwright test tests/ui/cart.spec.ts
                    npx playwright test -g "adds an item to the cart"
Typecheck:         npm run typecheck
Lint:              npm run lint
Report (generate): npm run report:generate       # requires Java
Report (open):     npm run report:open
Generate a test:   in Claude Code, in this repo: /qa-generate-test "<plain-English scenario>"
```

## Project Structure

```
src/core/elements/   → BaseElement + Button, Input, Dropdown, Checkbox, Link, Text (each carries
                        a locator + a human-readable "description" used by the healing agent).
                        Instantiated directly in page objects — no element factory.
src/core/pages/       → BasePage (urlPath + direct-element-construction convention),
                        PageObjectFactory
src/core/api/         → ApiClient (fetch wrapper), response-schema validation helpers
src/core/config/      → env/config loader (baseUrl, credentials, LLM provider selection)
src/core/agents/      → LlmProvider interface, AnthropicLlmProvider, MockLlmProvider (Strategy)
src/core/healing/     → AgentLocatorHealer: wraps a BaseElement resolution, retries via the agent
src/entities/         → response/domain-model interfaces (Post, CheckoutInfo)
src/testdata/         → test-data builders (Builder pattern, faker-seeded defaults)
src/pages/            → SauceDemo page objects (Login, Inventory, Cart, three Checkout pages)
tests/ui/             → Playwright UI specs
tests/api/            → Playwright API specs
tests/unit/           → Vitest unit specs for src/core/** and src/testdata/** (TDD)
.claude/skills/qa-*   → Claude Code skills for generating new tests (see Objective)
postman/              → exported collection.json + environment.json
sql/                  → query.sql + short explanation
.github/workflows/    → ci.yml
```

## Code Style

- Interfaces for every cross-boundary contract (`LlmProvider`, `Element`, `ApiClient`); concrete
  classes implement them, never used as concrete types across module boundaries.
- Factories only where there's a real choice to hide (`PageObjectFactory`, `LlmProviderFactory`);
  elements are constructed directly (`new Button(...)`) since there's no meaningful choice a
  factory would hide.
- One class per file, PascalCase filenames for classes, kebab-case for everything else.
- No default exports.

Example — an element definition and a page object using it:

```ts
// src/pages/sauce-demo/InventoryPage.ts
export class InventoryPage extends BasePage {
  readonly urlPath = '/inventory.html';

  readonly addBackpackToCartButton = new Button(
    this.page,
    {
      selector: '[data-test="add-to-cart-sauce-labs-backpack"]',
      description: 'Add to cart button on the Sauce Labs Backpack product card in the inventory grid',
    },
    this.healer,
  );

  async addBackpackToCart(): Promise<void> {
    await this.addBackpackToCartButton.click();
  }
}
```

## Testing Strategy

- **Unit (vitest, `tests/unit/**`)** — TDD for framework internals: element resolution and
  fallback logic, healing decision rules, test-data builder defaults/overrides. Fast, no browser,
  no network; LLM calls mocked via `MockLlmProvider`.
- **UI e2e (Playwright, `tests/ui/**`)** — real browser against saucedemo.com.
- **API (Playwright, `tests/api/**`)** — real HTTP against jsonplaceholder.typicode.com.
- No coverage threshold is enforced — the brief explicitly says depth of design matters more
  than breadth of coverage.

## Boundaries

- **Always do:** run `npm run typecheck` and the relevant test layer before considering a task
  done; keep `LlmProvider` implementations swappable; never hardcode the SauceDemo/jsonplaceholder
  hosts outside config.
- **Ask first:** committing an `ANTHROPIC_API_KEY` or any other secret anywhere in the repo;
  force-pushing; changing the target systems under test; anything that would make the public repo
  private or vice versa.
- **Never do:** commit `.env`, commit `node_modules`, disable/skip a failing test to make CI
  green without flagging it, let the self-healing agent silently rewrite source POM files (it may
  only heal at runtime + log; persisting a healed locator back to source is a human-reviewed
  follow-up, not automatic).

## Success Criteria

- [x] `npm test` passes (1 UI spec, 1 API spec) locally and in CI
- [x] `npm run test:unit` passes and demonstrably exercises the healing logic and test-data
      builder test-first
- [ ] Deliberately breaking the `addBackpackToCartButton` locator still lets the UI test pass via
      the self-healing agent (demo/proof) — needs a real `ANTHROPIC_API_KEY`, not yet exercised
- [ ] `qa-generate-test` produces a compilable spec + page object when invoked in Claude Code
      against a real scenario — implemented, not yet exercised end-to-end in this environment
- [x] Allure report generates and opens
- [x] GitHub Actions workflow is green on push
- [x] README covers install/run/report + Design Decisions (patterns used and why, what was
      skipped, what's next, and the scope-vs-brief framing)
- [x] Postman collection + environment exported to `postman/`, both requests carry the two
      required test assertions
- [x] `sql/query.sql` answers Part 3 correctly against the W3Schools Northwind sample data
- [x] Repo is public on GitHub under `VladyslavKostin` as `qa-automation-framework`, `node_modules`
      excluded

## Open Questions — resolved

- LLM access → user will supply `ANTHROPIC_API_KEY` locally after scaffolding; framework must
  run (with `MockLlmProvider`) without it.
- MCP → dev-time tooling only, not called at test runtime.
- Repo → create now, public, `qa-automation-framework`, push as work lands.
- Scope-vs-brief gap → addressed directly in the README.
- Test generation → implemented as Claude Code skills instead of a standalone CLI/tool (user
  feedback after the first pass); see README "Generating new tests" section for the reasoning.
