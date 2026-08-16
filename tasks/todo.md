# Todo: QA Automation Framework

## Scaffold
- [ ] Task: package.json, tsconfig.json, playwright.config.ts, vitest.config.ts, eslint+prettier
      config, .gitignore, .env.example, folder skeleton
  - Acceptance: `npm install` succeeds; `npm run typecheck` runs (even with zero files) with no
    config errors
  - Verify: `npm run typecheck`
  - Files: package.json, tsconfig.json, playwright.config.ts, vitest.config.ts, .eslintrc*,
    .gitignore, .env.example

## core-framework
- [ ] Task: `Element` interface + `BaseElement` + `Button`/`Input`/`Dropdown`/`Checkbox`/`Link`
      classes, each carrying `locator` + `description`
  - Acceptance: element classes compile, expose Playwright-locator-returning methods, unit
    tests cover description propagation and locator resolution
  - Verify: `npm run test:unit -- elements`
  - Files: src/core/elements/**, tests/unit/core/elements/**
- [ ] Task: `PageObject` interface + `BasePage` + `ElementFactory`/`PageObjectFactory`
  - Acceptance: a page object built via the factory exposes typed elements; unit-tested
  - Verify: `npm run test:unit -- pages`
  - Files: src/core/pages/**, tests/unit/core/pages/**
- [ ] Task: `ApiClient` abstraction (interface + fetch-based implementation) + schema validation
      helper
  - Acceptance: `ApiClient.get<T>()` typed, validation helper rejects missing/null/undefined keys
  - Verify: `npm run test:unit -- api-client`
  - Files: src/core/api/**, tests/unit/core/api/**
- [ ] Task: config loader (env vars → typed config: baseUrl, saucedemo creds, LLM provider choice)
  - Acceptance: loader falls back to sane defaults with no .env present; typed and unit-tested
  - Verify: `npm run test:unit -- config`
  - Files: src/core/config/**, tests/unit/core/config/**, .env.example

## ui-e2e-tests
- [ ] Task: SauceDemo `LoginPage`, `InventoryPage`, `CartPage` page objects on top of
      core-framework
  - Acceptance: pages expose the elements/actions needed for login → add-to-cart → verify-cart
  - Verify: manual instantiation compiles
  - Files: src/pages/sauce-demo/**
- [ ] Task: UI spec — log in, add an item, verify cart
  - Acceptance: `npx playwright test tests/ui/cart.spec.ts` passes against the real site
  - Verify: `npx playwright test tests/ui/cart.spec.ts`
  - Files: tests/ui/cart.spec.ts

## api-tests
- [ ] Task: API spec — GET a jsonplaceholder resource, assert response contract
  - Acceptance: `npx playwright test tests/api/*.spec.ts` passes against the real API
  - Verify: `npx playwright test tests/api/*.spec.ts`
  - Files: tests/api/*.spec.ts

## mcp-dev-tooling
- [ ] Task: `.mcp.json` wiring `@playwright/mcp` for editor-side use; doc note that it's dev-time
      only
  - Acceptance: file present, documented in README
  - Verify: manual review
  - Files: .mcp.json

## self-healing-agent
- [ ] Task: `LlmProvider` interface + `MockProvider` (deterministic) + `AnthropicProvider`
      (`@anthropic-ai/sdk`), selected via `LlmProviderFactory` based on config
  - Acceptance: unit tests cover provider selection and the mock's deterministic behaviour
  - Verify: `npm run test:unit -- llm-provider`
  - Files: src/core/agents/**, tests/unit/core/agents/**
- [ ] Task: `SelfHealingLocator` — on resolution failure, snapshot DOM, call `LlmProvider` with the
      element's description, retry once with the proposed selector, log the healing event
  - Acceptance: unit tests simulate a failing locator + mock provider proposing a fix; a real
    demo test intentionally breaks a SauceDemo locator to prove the behaviour (documented as
    requiring a live key to actually heal)
  - Verify: `npm run test:unit -- self-healing`
  - Files: src/core/healing/**, tests/unit/core/healing/**

## test-orchestrator-agents
- [ ] Task: `PlannerAgent`, `WriterAgent`, `PageObjectAgent`, `Orchestrator` (pipeline), CLI
      entrypoint (`npm run generate:test -- "<scenario>"`)
  - Acceptance: unit tests exercise the pipeline end-to-end with `MockProvider`, producing
    well-formed output; CLI wired in package.json
  - Verify: `npm run test:unit -- orchestrator`
  - Files: tools/orchestrator/**, tests/unit/orchestrator/**

## reporting
- [ ] Task: wire `allure-playwright` reporter into playwright.config.ts; add
      `report:generate`/`report:open` npm scripts
  - Acceptance: after a test run, `npm run report:generate && npm run report:open` produces and
    opens an HTML report
  - Verify: manual run
  - Files: playwright.config.ts, package.json

## ci
- [ ] Task: `.github/workflows/ci.yml` — install, typecheck, lint, unit tests, e2e tests, upload
      Allure results as an artifact
  - Acceptance: workflow is valid YAML and green once pushed
  - Verify: `gh run watch` after push (or manual YAML review if not pushed yet)
  - Files: .github/workflows/ci.yml

## postman-collection
- [ ] Task: Postman collection (`users`, `posts?userId=1` GET requests) + environment with
      `baseUrl`, each request with status-200 + non-empty-field tests
  - Acceptance: importable JSON, tests present in each request
  - Verify: manual/Newman review
  - Files: postman/collection.json, postman/environment.json

## sql-query
- [ ] Task: SQL query answering Part 3 against the W3Schools Northwind sample DB
  - Acceptance: query documented with a one-line explanation
  - Verify: manual run in the W3Schools Try-It editor
  - Files: sql/query.sql

## docs
- [ ] Task: README — install/run (full suite + single test), open the report, architecture
      overview, patterns used and why, agent setup instructions, Design Decisions section
      (including the scope-vs-brief framing)
  - Acceptance: a new reader can install, run, and open the report from the README alone
  - Verify: manual read-through
  - Files: README.md

## publish
- [ ] Task: git init, initial commit, create public GitHub repo `qa-automation-framework` under
      `VladyslavKostin`, push
  - Acceptance: repo is public, reachable, `node_modules` excluded
  - Verify: `gh repo view VladyslavKostin/qa-automation-framework`
  - Files: (repo-level)
