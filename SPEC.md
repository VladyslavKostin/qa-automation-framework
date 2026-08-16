# Spec: QA Automation Framework

## Objective

A from-scratch TypeScript + Playwright test automation framework demonstrating SOLID/OOP
architecture, design patterns, and two AI-agent capabilities layered on top of a conventional
POM framework:

- **UI test**: log in to https://www.saucedemo.com/, add an item to the cart, verify the cart.
- **API test**: GET a resource from https://jsonplaceholder.typicode.com/, assert the response
  contract.
- **Self-healing locators**: when a locator fails, an agent uses the element's own description
  metadata + a DOM snapshot to propose a replacement selector, so a UI change doesn't necessarily
  fail the run.
- **Test-generation orchestrator**: a Planner → Writer → PageObject agent pipeline that turns a
  plain-English scenario into a new Playwright spec + page object, following this repo's
  conventions.

Users: the Limestone Digital reviewers (grading against the brief), and — secondarily — this
repo as a personal portfolio piece on `VladyslavKostin`'s GitHub.

Success looks like: `npm test` runs the UI + API suites green, `npm run report` opens an Allure
report, `npm run generate:test -- "<scenario>"` produces a working draft spec, and a locator that
is deliberately broken in a demo still gets healed and passes.

## Tech Stack

- TypeScript (strict mode), Node.js ≥18
- `@playwright/test` for UI + API tests
- `vitest` for unit-testing framework internals (element resolution, healing decision logic,
  orchestrator agents) — this is the TDD layer, isolated from live browser/network I/O
- `allure-playwright` + `allure-commandline` for reporting (Java is available in this
  environment and is required to generate the classic Allure HTML report)
- `@anthropic-ai/sdk` behind a provider interface — `AnthropicProvider` (real) and
  `MockProvider` (deterministic, no network) implement the same `LlmProvider` contract
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
Generate a test:   npm run generate:test -- "As a user, I can remove an item from the cart"
```

## Project Structure

```
src/core/elements/   → BaseElement + Button, Input, Dropdown, Checkbox, Link... (each carries
                        a locator + a human-readable "description" used by the healing agent)
src/core/pages/       → BasePage, PageObjectFactory
src/core/api/         → ApiClient (fetch wrapper), response-schema validation helpers
src/core/config/      → env/config loader (baseUrl, credentials, LLM provider selection)
src/core/agents/      → LlmProvider interface, AnthropicProvider, MockProvider (Strategy)
src/core/healing/     → SelfHealingLocator: wraps a BaseElement resolution, retries via the agent
src/pages/            → SauceDemo page objects (LoginPage, InventoryPage, CartPage)
tools/orchestrator/   → PlannerAgent, WriterAgent, PageObjectAgent, Orchestrator, CLI entrypoint
tests/ui/             → Playwright UI specs
tests/api/            → Playwright API specs
tests/unit/           → Vitest unit specs for src/core/** (TDD)
postman/              → exported collection.json + environment.json
sql/                  → query.sql + short explanation
.github/workflows/    → ci.yml
```

## Code Style

- Interfaces for every cross-boundary contract (`LlmProvider`, `Element`, `PageObject`,
  `ApiClient`); concrete classes implement them, never used as concrete types across module
  boundaries.
- Factories (`ElementFactory`, `PageObjectFactory`, `LlmProviderFactory`) construct concrete
  instances so call sites depend on interfaces, not `new` (Dependency Inversion).
- One class per file, PascalCase filenames for classes, kebab-case for everything else.
- No default exports.

Example — an element definition and a page object using it:

```ts
// src/pages/sauce-demo/inventory.page.ts
export class InventoryPage extends BasePage {
  readonly addToCartButton = this.elements.button({
    locator: '[data-test="add-to-cart-sauce-labs-backpack"]',
    description: 'Add to cart button for the Sauce Labs Backpack card on the inventory grid',
  });

  async addBackpackToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}
```

## Testing Strategy

- **Unit (vitest, `tests/unit/**`)** — TDD for framework internals: element resolution and
  fallback logic, healing decision rules, agent prompt assembly / pipeline sequencing. Fast, no
  browser, no network; LLM calls mocked via `MockProvider`.
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

- [ ] `npm test` passes (1 UI spec, 1 API spec minimum) locally
- [ ] `npm run test:unit` passes and demonstrably exercises the healing/orchestrator logic
      test-first
- [ ] Deliberately breaking the `addToCartButton` locator still lets the UI test pass via the
      self-healing agent (demo/proof), when a real API key is configured
- [ ] `npm run generate:test -- "<scenario>"` produces a compilable spec + page object, when a
      real API key is configured
- [ ] Allure report generates and opens
- [ ] GitHub Actions workflow is green on push
- [ ] README covers install/run/report + Design Decisions (patterns used and why, what was
      skipped, what's next, and the scope-vs-brief framing)
- [ ] Postman collection + environment exported to `postman/`, both requests carry the two
      required test assertions
- [ ] `sql/query.sql` answers Part 3 correctly against the W3Schools Northwind sample data
- [ ] Repo is public on GitHub under `VladyslavKostin` as `qa-automation-framework`, `node_modules`
      excluded

## Open Questions — resolved

- LLM access → user will supply `ANTHROPIC_API_KEY` locally after scaffolding; framework must
  run (with `MockProvider`) without it.
- MCP → dev-time tooling only, not called at test runtime.
- Repo → create now, public, `qa-automation-framework`, push as work lands.
- Scope-vs-brief gap → addressed directly in the README.
