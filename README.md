# QA Automation Framework

A from-scratch **TypeScript + Playwright** test automation framework, built for the Limestone
Digital QA Automation Engineer test task and extended into a fuller architecture showcase (see
[Scope vs. the brief](#scope-vs-the-brief) below for why, and what that trade-off costs).

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
- **Template Method** (`BaseElement.perform`) — the find-it/act-on-it/heal-on-failure sequence is
  implemented exactly once; `Button`, `Input`, `Dropdown`, `Checkbox`, `Link`, `Text` only add the
  interactions specific to them.
- **Strategy** (`LlmProvider`) — `MockLlmProvider` and `AnthropicLlmProvider` implement the same
  contract; which one the self-healing agent uses is a config decision, not a code branch.
- **Defensive parsing, not blind trust** (`AgentLocatorHealer`) — the LLM's reply is treated as
  untrusted input: a malformed or incomplete JSON reply makes healing a no-op (the original error
  propagates) instead of throwing something worse. This is also exactly what happens when
  `MockLlmProvider` is in play, which is what makes healing unit-testable with zero API key.

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

## Design decisions

1. **Interfaces + Strategy wherever a concrete choice could change** (LLM provider, healer, API
   client), **factories only where there's a real choice to hide** (`PageObjectFactory`,
   `LlmProviderFactory` — not elements, see [Patterns, and why](#patterns-and-why)) — the payoff is
   that `MockLlmProvider` makes the self-healing agent fully unit-testable and runnable with zero
   external dependency, without adding indirection where nothing actually varies.
2. **Deliberately skipped:** persisting healed locators back to source (kept human-reviewed, see
   above); a `@smoke` tag / project matrix (one UI + one API spec — no coverage to segment yet);
   `storageState` auth setup (SauceDemo's login is one step and already fast; the complexity
   wasn't earning its keep at this scale).
3. **What's live-key-dependent but unverified in this environment:** the self-healing agent is
   implemented and unit-tested against `MockLlmProvider`, but its `AnthropicLlmProvider` path has
   not been run end-to-end here — no `ANTHROPIC_API_KEY` was available while building this. Test
   *generation* has no equivalent gap: it's implemented as Claude Code skills (see above), which
   don't depend on a runtime API key at all.
4. **What else I'd add with more time:** a `@smoke` tag once there's enough coverage to make
   segmentation worthwhile; a visual diff check on the SauceDemo cart page; retry/backoff on the
   `AnthropicLlmProvider` call; persisting healing events to the Allure report as attachments
   instead of just being inspectable in-process.
5. **Framework-internals are TDD'd, product-facing specs are not** — `tests/unit/**` (28 tests)
   drove the design of `BaseElement.perform`, the healing agent's parse-with-fallback behavior, and
   `CheckoutInfoBuilder` before the "real" UI/API specs were written against them; the two
   Playwright specs themselves are straightforward enough not to need a red-green cycle of their
   own.

### Scope vs. the brief

The brief is explicit: *"we are not looking for coverage, we are looking at how you structure a
suite and why... a small, well-designed solution scores higher than a large one,"* and lists the
AI/architecture-heavy extras as **one, optional, only-if-time-remains** item. This repo
intentionally goes well past that — SOLID/OOP layering, multiple design patterns, self-healing
locators, a test-data builder, and Claude Code skills for generating new tests — at the explicit
direction of the person I built this for, as a capability showcase rather than a literal 1-hour
submission. A right-sized
submission against the brief alone would have been: `BaseElement` + one concrete element type (or
none at all, just `page.locator()` calls), the two required specs, and **one** optional extra
(this repo would pick the Allure reporter or the CI workflow). I'm flagging that gap here rather
than leaving it implicit, since the brief itself asks for exactly that kind of documented
assumption.
