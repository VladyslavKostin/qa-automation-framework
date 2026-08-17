# QA Automation Framework

A from-scratch **TypeScript + Playwright** test automation framework, built for the Limestone
Digital QA Automation Engineer test task.

- **Part 1** — this repo: a UI test (SauceDemo: log in → add to cart → checkout) and an API test
  (jsonplaceholder: GET + contract assertions), built on a SOLID/OOP framework with self-healing
  locators and a set of Claude Code skills for generating new tests.
- **Part 2** — [`postman/`](postman/): a Postman collection + environment for the two required
  jsonplaceholder GET requests.
- **Part 3** — [`sql/query.sql`](sql/query.sql): the SQL query for the Northwind "United Package"
  shipper question, verified live against the W3Schools Try-It editor.

## Quick start

```bash
npm install
npx playwright install --with-deps chromium

# everything
npm test                # UI + API Playwright suites
npm run test:unit       # unit tests for the framework internals (Vitest, TDD)

# a single test
npx playwright test tests/ui/cart.spec.ts
npx playwright test -g "adds an item to the cart"

# quality gates
npm run typecheck
npm run lint
```

Configuration is environment-driven with sane defaults — see [`.env.example`](.env.example).
Copy it to `.env` to override anything (base URLs, SauceDemo credentials, LLM provider).

## Opening the report

```bash
npm test                           # produces Playwright's HTML report + raw Allure results
npx playwright show-report         # Playwright's own HTML report

npm run report:generate            # builds the Allure HTML report from allure-results/ (needs Java)
npm run report:open                # serves it and opens a browser
```

## Architecture

```
src/core/elements/   Element interface, BaseElement, Button/Input/Dropdown/Checkbox/Link/Text —
                      each carries a locator AND a human-readable description. Instantiated
                      directly in page objects (new Button(...)) — no element factory.
src/core/pages/       BasePage (urlPath + direct-element-construction convention),
                      PageObjectFactory
src/core/api/         ApiClient interface, FetchApiClient, response-contract assertion helper
src/core/config/      typed env-var loader — the one place that reads process.env
src/core/agents/      LlmProvider interface, MockLlmProvider (offline/deterministic),
                      AnthropicLlmProvider, LlmProviderFactory — used by the self-healing agent
src/core/healing/     LocatorHealer interface, DOM-candidate snapshotting, AgentLocatorHealer
src/core/fixtures/    the Playwright `test`/`expect` re-export every spec imports, wired with
                      the healer and ApiClient
src/entities/         plain response/domain-model interfaces (Post, CheckoutInfo) — never
                      declared inline in a test or page object
src/testdata/         test-data builders (Builder pattern, @faker-js/faker-seeded defaults)
src/pages/sauce-demo/ LoginPage, InventoryPage, CartPage, CheckoutStepOnePage,
                      CheckoutOverviewPage, CheckoutCompletePage — the Part 1 UI target
src/flows/sauce-demo/ SauceDemoFlows — reusable, test.step()-wrapped action steps (login, add to
                      cart, checkout, ...) composed from page objects, shared across spec files
tests/ui/, tests/api/ the two required Playwright specs
tests/unit/           Vitest specs for everything under src/core and src/testdata
.claude/skills/qa-*   Claude Code skills for generating new tests — see below
postman/              Part 2 deliverable
sql/                  Part 3 deliverable
.github/workflows/    CI
```

### Patterns, and why

- **Dependency Inversion via interfaces** (`Element`, `ApiClient`, `LlmProvider`,
  `LocatorHealer`) — every cross-boundary contract is an interface; concrete classes are never
  referenced by type outside their own module. This is what lets `MockLlmProvider` stand in for
  `AnthropicLlmProvider` with zero changes to any call site.
- **Factory, scoped to where it earns its keep** (`PageObjectFactory`, `LlmProviderFactory`) —
  page objects and LLM providers are built through a factory instead of a bare `new`. Elements are
  the deliberate exception: `new Button(this.page, { selector, description }, this.healer)` is
  called directly in page objects, because an element factory added a layer of indirection with no
  payoff — there's only ever one way to build a `Button`, so a factory for it just hid the
  constructor call instead of replacing a meaningful choice.
- **Builder** (`CheckoutInfoBuilder`) — pre-filled with `@faker-js/faker` defaults, `with*()`
  methods override only the field(s) a given test cares about, `.build()` returns a plain
  `CheckoutInfo`. Used in `tests/ui/cart.spec.ts` to drive the checkout form with realistic,
  non-hardcoded data.
- **Facade** (`SauceDemoFlows`) — each method (`loginAsStandardUser`, `addBackpackToCart`,
  `fillCheckoutInfoAndContinue`, ...) hides the coordination of several page objects behind one
  call, wrapped in its own `test.step()`. Any spec composes these instead of re-typing the same
  step bodies — see [Reusable flows](#reusable-flows) below.
- **Template Method** (`BaseElement.perform`) — the find-it/act-on-it/heal-on-failure sequence is
  implemented exactly once; `Button`, `Input`, `Dropdown`, `Checkbox`, `Link`, `Text` only add the
  interactions specific to them.
- **Strategy** (`LlmProvider`) — `MockLlmProvider` and `AnthropicLlmProvider` implement the same
  contract; which one the self-healing agent uses is a config decision, not a code branch.
- **Defensive parsing, not blind trust** (`AgentLocatorHealer`) — the LLM's reply is treated as
  untrusted input: a malformed or incomplete JSON reply makes healing a no-op (the original error
  propagates) instead of throwing something worse. This is also exactly what happens when
  `MockLlmProvider` is in play, which is what makes healing unit-testable with zero API key.

## Reusable flows

The first pass wrote each `test.step()` action inline in `tests/ui/cart.spec.ts`. Since those
steps (log in, add an item, verify the cart, fill checkout info, finish, verify confirmation) are
exactly the kind of thing a second spec would need too, they now live once in
[`src/flows/sauce-demo/SauceDemoFlows.ts`](src/flows/sauce-demo/SauceDemoFlows.ts), each still
wrapped in its own `test.step()` so the Allure/Playwright report breakdown is unchanged:

```ts
const flows = new SauceDemoFlows(page, pages);

await flows.loginAsStandardUser(config.ui.username, config.ui.password);
await flows.addBackpackToCart();
await flows.verifyCartContains('Sauce Labs Backpack');
```

A new spec — say, "remove an item from the cart" — reuses `loginAsStandardUser` and
`addBackpackToCart` as-is and only adds its own new step(s); nothing about login or add-to-cart
gets retyped or drifts out of sync between specs. New flows for other journeys follow the same
shape: one class per feature under `src/flows/<feature>/`, constructed with `(page,
pages)`, one method per reusable step.

## Self-healing locators

Every element (`new Button(this.page, { selector, description }, this.healer)`) carries a
`description` alongside its selector. When an action on that element fails, `BaseElement.perform`
calls the configured `LocatorHealer` exactly once:

1. `captureCandidates` grabs a bounded snapshot of interactive elements from the live DOM.
2. `AgentLocatorHealer` asks the configured `LlmProvider` to match the element's `description`
   against those candidates and propose a replacement selector.
3. On a valid reply, the element retries the original action once with the new selector and the
   healing event is available for inspection; on no match / a malformed reply, the original error
   propagates — healing is a safety net, not a retry loop.

By default (no `ANTHROPIC_API_KEY`), `MockLlmProvider` powers this with a deterministic
keyword-overlap heuristic — good enough to prove the wiring and to unit-test
(`tests/unit/core/healing/AgentLocatorHealer.spec.ts`,
`tests/unit/core/agents/MockLlmProvider.spec.ts`), not a real "understanding" of the page. To see
it do something closer to what it's designed for, set `ANTHROPIC_API_KEY` in `.env` and
deliberately break a selector in `src/pages/sauce-demo/InventoryPage.ts` — the UI spec should
still pass. **This live-key path has not been exercised in this environment** (no key was
available while building it) — treat it as implemented-and-unit-tested, not
demonstrated-end-to-end. `SELF_HEALING_ENABLED=false` turns the whole thing off.

Healing never rewrites source files — a healed selector lives only for the duration of that test
run. Persisting a healed locator back into a page object is a deliberate human-reviewed follow-up,
not something the agent does silently (see [Boundaries](SPEC.md#boundaries) in `SPEC.md`).

## Generating new tests: Claude Code skills, not a CLI tool

Test generation ("planner agent, writer agent, page-object agent") is implemented as **Claude Code
skills** under [`.claude/skills/`](.claude/skills/), not as a standalone program that calls an LLM
API at runtime:

- [`qa-test-planner`](.claude/skills/qa-test-planner/SKILL.md) — turns a plain-English scenario
  into a structured plan (target pages, chain of actions, assertions, test-data needs).
- [`qa-page-object-writer`](.claude/skills/qa-page-object-writer/SKILL.md) — writes/updates a page
  object for that plan, inspecting the real target page (via Playwright MCP, see below) rather
  than guessing selectors.
- [`qa-test-writer`](.claude/skills/qa-test-writer/SKILL.md) — writes the `.spec.ts` file as a
  chain of `test.step()` actions.
- [`qa-generate-test`](.claude/skills/qa-generate-test/SKILL.md) — runs all three in sequence; that
  file also explains the "skills, not a tool" reasoning in full.

In Claude Code, in this repo: `/qa-generate-test As a user, I can remove an item from the cart`
(or ask in plain English — Claude picks the skill up from its description). This intentionally
does **not** need `ANTHROPIC_API_KEY` or any runtime `LlmProvider` wiring — it runs as Claude
itself, inside a session that already has full repo context, rather than a separate process
calling out to an API. Contrast this with self-healing locators above, which run unattended inside
a live test process and do need real runtime code for exactly that reason.

## Playwright MCP (dev-time only)

[`.mcp.json`](.mcp.json) wires the official `@playwright/mcp` server for editor-side / agentic use
(e.g. Claude Code) while authoring tests or diagnosing a failure interactively — in particular,
`qa-page-object-writer` uses it to read a target page's real `data-test` attributes instead of
guessing. It is **not** called at test runtime — the framework's own healing agent talks to
Playwright directly, not through MCP. This was a deliberate scope choice; see
[Design decisions](#design-decisions).

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push/PR to `main`: install →
typecheck → lint → unit tests → Playwright browser install → UI+API tests → Allure + Playwright
HTML reports uploaded as workflow artifacts (`if: always()`, so a failing run still leaves a
report to inspect).

## Postman collection (Part 2)

```bash
npx newman run postman/collection.json -e postman/environment.json
```

Two requests (`GET /users`, `GET /posts?userId=1`) against `{{baseUrl}}` (from the environment,
not hardcoded), each asserting status 200 and that every returned object's key properties are
present and non-empty — mirroring `assertHasNonEmptyFields` in `src/core/api/schema.ts` so the
Postman and TypeScript suites express the same contract check the same way. Verified locally: 7/7
assertions pass against the live API.

## SQL query (Part 3)

[`sql/query.sql`](sql/query.sql) — customer names and countries that used "United Package" as
their shipper, joining `Customers → Orders → Shippers` on the Northwind sample schema. Run live in
the W3Schools Try-It editor during this build: 45 rows returned.
