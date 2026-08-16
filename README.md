# QA Automation Framework

A from-scratch **TypeScript + Playwright** test automation framework, built for the Limestone
Digital QA Automation Engineer test task and extended into a fuller architecture showcase (see
[Scope vs. the brief](#scope-vs-the-brief) below for why, and what that trade-off costs).

- **Part 1** — this repo: a UI test (SauceDemo: log in → add to cart → verify cart) and an API
  test (jsonplaceholder: GET + contract assertions), built on a SOLID/OOP framework with
  self-healing locators and an AI test-generation orchestrator.
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
                      each carries a locator AND a human-readable description
src/core/pages/       BasePage, PageObjectFactory
src/core/api/         ApiClient interface, FetchApiClient, response-contract assertion helper
src/core/config/      typed env-var loader — the one place that reads process.env
src/core/agents/      LlmProvider interface, MockLlmProvider (offline/deterministic),
                      AnthropicLlmProvider, LlmProviderFactory
src/core/healing/     LocatorHealer interface, DOM-candidate snapshotting, AgentLocatorHealer
src/core/fixtures/    the Playwright `test`/`expect` re-export every spec imports, wired with
                      the healer and ApiClient
src/pages/sauce-demo/ LoginPage, InventoryPage, CartPage — the Part 1 UI target
tests/ui/, tests/api/ the two required Playwright specs
tests/unit/           Vitest specs for everything under src/core and tools/orchestrator
tools/orchestrator/   PlannerAgent, PageObjectAgent, WriterAgent, Orchestrator, CLI
postman/              Part 2 deliverable
sql/                  Part 3 deliverable
.github/workflows/    CI
```

### Patterns, and why

- **Dependency Inversion via interfaces** (`Element`, `ApiClient`, `LlmProvider`,
  `LocatorHealer`) — every cross-boundary contract is an interface; concrete classes are never
  referenced by type outside their own module. This is what lets `MockLlmProvider` stand in for
  `AnthropicLlmProvider` with zero changes to any call site.
- **Factory** (`ElementFactory`, `PageObjectFactory`, `LlmProviderFactory`) — call sites ask a
  factory for an interface-typed instance instead of calling `new` on a concrete class. Adding a
  new element type or provider never touches a page object or test file.
- **Template Method** (`BaseElement.perform`) — the find-it/act-on-it/heal-on-failure sequence is
  implemented exactly once; `Button`, `Input`, `Dropdown`, `Checkbox`, `Link`, `Text` only add the
  interactions specific to them.
- **Strategy** (`LlmProvider`) — `MockLlmProvider` and `AnthropicLlmProvider` implement the same
  contract; which one runs is a config decision, not a code branch.
- **Pipeline / Chain of Responsibility** (`Orchestrator`) — Planner → PageObjectAgent → WriterAgent
  each does one job and hands a typed value to the next stage.
- **Defensive parsing, not blind trust** — every agent (`PlannerAgent`, `PageObjectAgent`,
  `WriterAgent`, `AgentLocatorHealer`) treats the LLM's reply as untrusted input: a malformed or
  incomplete JSON reply falls back to a deterministic result instead of throwing. This is also
  exactly what happens when `MockLlmProvider` is in play, which is what makes the whole pipeline
  unit-testable and runnable with zero API key.

## Self-healing locators

Every element (`this.elements.button({ selector, description })`) carries a `description`
alongside its selector. When an action on that element fails, `BaseElement.perform` calls the
configured `LocatorHealer` exactly once:

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

## Test-generation orchestrator

```bash
npm run generate:test -- "As a user, I can remove an item from the cart"
```

Runs `PlannerAgent → PageObjectAgent → WriterAgent` and writes a new page object under
`src/pages/generated/` and a new spec under `tests/ui/generated/` (both gitignored — review before
committing). Without `ANTHROPIC_API_KEY` this produces a compilable but generic offline skeleton,
not scenario-aware code — see [`docs/examples/orchestrator-output/`](docs/examples/orchestrator-output/)
for exactly what that looks like (renamed `.txt` so it isn't picked up by the compiler or test
runner). **The scenario-aware, live-key path is implemented and reuses the same `LlmProvider` as
the healing agent, but — like the healing agent's live path — has not been exercised in this
environment**; set `ANTHROPIC_API_KEY` to try real generation.

## Playwright MCP (dev-time only)

[`.mcp.json`](.mcp.json) wires the official `@playwright/mcp` server for editor-side / agentic use
(e.g. Claude Code) while authoring tests or diagnosing a failure interactively. It is **not**
called at test runtime — the framework's own healing agent talks to Playwright directly, not
through MCP. This was a deliberate scope choice; see [Design decisions](#design-decisions).

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

## Design decisions

1. **Interfaces + factories + Strategy everywhere a concrete choice could change** (LLM provider,
   healer, API client) — the cost is more files for a two-test suite; the payoff is that
   `MockLlmProvider` makes the AI-agent features fully unit-testable and runnable with zero
   external dependency, which felt non-negotiable for something this AI-dependent.
2. **Deliberately skipped:** persisting healed locators back to source (kept human-reviewed,
   see above); a `@smoke` tag / project matrix (only two specs exist — no coverage to segment
   yet); `storageState` auth setup (SauceDemo's login is one step and already fast; the
   complexity wasn't earning its keep at this scale).
3. **What's live-key-dependent but unverified in this environment:** both agent features
   (self-healing, orchestrator) are implemented and unit-tested against `MockLlmProvider`, but
   their `AnthropicLlmProvider` path has not been run end-to-end here — no `ANTHROPIC_API_KEY` was
   available while building this. With more time: run both live, and add a CI job variant that
   exercises them with a repo secret.
4. **What else I'd add with more time:** a `@smoke` tag once there's enough coverage to make
   segmentation worthwhile; a visual diff check on the SauceDemo cart page; retry/backoff on the
   `AnthropicLlmProvider` call; persisting healing events to the Allure report as attachments
   instead of just being inspectable in-process.
5. **Framework-internals are TDD'd, product-facing specs are not** — `tests/unit/**` (33 tests)
   drove the design of `BaseElement.perform`, the agents' parse-with-fallback behavior, and the
   orchestrator pipeline before the "real" UI/API specs were written against them; the two
   Playwright specs themselves are straightforward enough not to need a red-green cycle of their
   own.

### Scope vs. the brief

The brief is explicit: *"we are not looking for coverage, we are looking at how you structure a
suite and why... a small, well-designed solution scores higher than a large one,"* and lists the
AI/architecture-heavy extras as **one, optional, only-if-time-remains** item. This repo
intentionally goes well past that — SOLID/OOP layering, multiple design patterns, self-healing
locators, and a multi-agent test-generation orchestrator — at the explicit direction of the person
I built this for, as a capability showcase rather than a literal 1-hour submission. A right-sized
submission against the brief alone would have been: `BaseElement` + one concrete element type (or
none at all, just `page.locator()` calls), the two required specs, and **one** optional extra
(this repo would pick the Allure reporter or the CI workflow). I'm flagging that gap here rather
than leaving it implicit, since the brief itself asks for exactly that kind of documented
assumption.
