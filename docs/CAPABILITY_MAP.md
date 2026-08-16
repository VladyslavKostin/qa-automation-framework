# Capability Map: QA Automation Framework (Limestone Digital test task + extended showcase)

Source brief: `Test Task.docx [Anna].docx.pdf` (Limestone Digital, QA Automation Engineer).
The brief itself asks for a *small* framework with one UI test and one API test, plus **one**
optional extra. The user directing this build explicitly asked to go further — SOLID/OOP,
design patterns, self-healing locators, and test generation — and to ignore the 1-hour framing.
This map reflects the extended scope, including a revision (see `publish` history) that replaced
a standalone TypeScript test-orchestrator tool with Claude Code skills, removed the element
factory in favor of direct element construction, and added entities + a test-data builder. See
`SPEC.md` §Boundaries and the README "Design decisions" section for how the scope gap is framed
for reviewers.

| Module id | Responsibility | Depends on |
|---|---|---|
| `core-framework` | SOLID/OOP TS architecture: `BaseElement` + typed element classes (Button, Input, Dropdown, Checkbox…) carrying a locator *and* a human-readable description, instantiated directly in page objects; `BasePage` (with `urlPath`) + `PageObjectFactory`; `ApiClient` abstraction; config/env loading; Playwright fixtures | — |
| `entities-and-testdata` | Domain/response-model interfaces (`src/entities/`: `Post`, `CheckoutInfo`) and test-data builders (`src/testdata/`: `CheckoutInfoBuilder`, Builder pattern, `@faker-js/faker`-seeded defaults) | `core-framework` |
| `ui-e2e-tests` | Saucedemo: log in → add item to cart → verify cart → checkout with builder-generated data, built on `core-framework` POM, written as a chain of `test.step()` actions | `core-framework`, `entities-and-testdata` |
| `api-tests` | jsonplaceholder: GET a resource, assert response contract/schema against a `src/entities/` type | `core-framework`, `entities-and-testdata` |
| `self-healing-agent` | Runtime handler: when a locator fails, uses the element's description + a live DOM snapshot to ask an LLM for a replacement selector, retries once, records the healing event. Pluggable `LlmProvider` (Strategy pattern); falls back to a deterministic mock provider when no API key is configured, so the suite never depends on a live key to run | `core-framework` |
| `mcp-dev-tooling` | `.mcp.json` wiring the official Playwright MCP server for editor/agent-assisted authoring & debugging. Dev-time only — not called at test runtime; used by the `qa-page-object-writer` skill to read real selectors | `core-framework` |
| `qa-skills` | `.claude/skills/qa-test-planner`, `qa-page-object-writer`, `qa-test-writer`, `qa-generate-test` — Claude Code skills (not runtime code) that turn a plain-English scenario into a new spec + page object following this repo's conventions. Superseded the original TS orchestrator tool per direct user feedback: skills run as Claude itself, with full repo context, instead of a separate process calling an LLM API | `core-framework`, `mcp-dev-tooling` |
| `reporting` | Allure adapter wired into Playwright config + npm scripts to generate/open the report | `core-framework` |
| `ci` | GitHub Actions: install → typecheck/lint → unit tests → UI+API e2e tests → publish Allure report as a workflow artifact | `ui-e2e-tests`, `api-tests`, `reporting` |
| `docs` | README: architecture, patterns and why, agent setup, Design Decisions (incl. scope framing) | all of the above |
| `postman-collection` | Postman collection + environment (`baseUrl` variable) for `/users` and `/posts?userId=1`, each with status-200 + non-empty-field assertions | — |
| `sql-query` | Documented SQL query (W3Schools Northwind sample DB) for customer names/countries who used United Package as shipper | — |
| `publish` | `git init`, commits, create public GitHub repo `qa-automation-framework` under `VladyslavKostin`, push | everything above committed |

**Build order:**
`core-framework` → `entities-and-testdata` → (`ui-e2e-tests`, `api-tests`, `mcp-dev-tooling`,
`reporting` in parallel) → `self-healing-agent` → `qa-skills` → `ci` → `docs` →
(`postman-collection`, `sql-query` — independent, any time) → `publish`
