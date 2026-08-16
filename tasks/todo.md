# Todo: QA Automation Framework

## Scaffold
- [x] Task: package.json, tsconfig.json, playwright.config.ts, vitest.config.ts, eslint+prettier
      config, .gitignore, .env.example, folder skeleton

## core-framework
- [x] Task: `Element` interface + `BaseElement` + `Button`/`Input`/`Dropdown`/`Checkbox`/`Link`
      classes, each carrying `locator` + `description`
- [x] Task: `PageObject` interface + `BasePage` + `ElementFactory`/`PageObjectFactory`
- [x] Task: `ApiClient` abstraction (interface + fetch-based implementation) + schema validation
      helper
- [x] Task: config loader (env vars → typed config: baseUrl, saucedemo creds, LLM provider choice)

## ui-e2e-tests
- [x] Task: SauceDemo `LoginPage`, `InventoryPage`, `CartPage` page objects on top of
      core-framework
- [x] Task: UI spec — log in, add an item, verify cart (passes against the real site)

## api-tests
- [x] Task: API spec — GET a jsonplaceholder resource, assert response contract (passes against
      the real API)

## mcp-dev-tooling
- [x] Task: `.mcp.json` wiring `@playwright/mcp` for editor-side use; documented in README

## self-healing-agent
- [x] Task: `LlmProvider` interface + `MockLlmProvider` (deterministic) + `AnthropicLlmProvider`,
      selected via `LlmProviderFactory` based on config
- [x] Task: `AgentLocatorHealer` — on resolution failure, snapshot DOM, call `LlmProvider` with the
      element's description, retry once, log the healing event. Unit-tested; live-key path
      documented as unverified in this environment (see README)

## test-orchestrator-agents
- [x] Task: `PlannerAgent`, `WriterAgent`, `PageObjectAgent`, `Orchestrator` (pipeline), CLI
      entrypoint (`npm run generate:test -- "<scenario>"`). Smoke-tested for real; offline output
      committed as a reference under docs/examples/orchestrator-output/

## reporting
- [x] Task: wire `allure-playwright` reporter into playwright.config.ts; add
      `report:generate`/`report:open` npm scripts — verified report generates locally

## ci
- [x] Task: `.github/workflows/ci.yml` — install, typecheck, lint, unit tests, e2e tests, upload
      Allure + Playwright reports as artifacts

## postman-collection
- [x] Task: Postman collection (`users`, `posts?userId=1` GET requests) + environment with
      `baseUrl`, each request with status-200 + non-empty-field tests — verified with Newman
      (7/7 assertions pass against the live API)

## sql-query
- [x] Task: SQL query answering Part 3 against the W3Schools Northwind sample DB — verified live
      in the Try-It editor (45 rows)

## docs
- [x] Task: README — install/run (full suite + single test), open the report, architecture
      overview, patterns used and why, agent setup instructions, Design Decisions section
      (including the scope-vs-brief framing)

## publish
- [x] Task: git init, initial commit, create public GitHub repo `qa-automation-framework` under
      `VladyslavKostin`, push (repo created early; final push happens once everything above is
      verified)
