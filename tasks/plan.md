# Plan: QA Automation Framework

Implements `SPEC.md` per the build order in `docs/CAPABILITY_MAP.md`.

## Components & dependencies

1. **Scaffold** — package.json, tsconfig, playwright.config.ts, eslint/prettier, .gitignore,
   .env.example, folder skeleton. Nothing else can start before this.
2. **core-framework** — BaseElement + element classes, BasePage/factory, ApiClient, config
   loader. Defines every convention downstream modules follow. Built test-first (vitest) for the
   pure-logic pieces (element resolution, factory wiring).
3. **ui-e2e-tests** + **api-tests** — depend on (2). Small, built directly against the SauceDemo
   and jsonplaceholder targets fixed by the brief.
4. **mcp-dev-tooling** — depends on (2) only for folder conventions; otherwise independent,
   trivial config.
5. **self-healing-agent** — depends on (2). `LlmProvider` interface + `MockProvider` +
   `AnthropicProvider`, `SelfHealingLocator` wrapper, unit tests first (mock provider), then wired
   into `BaseElement` resolution as an opt-in fallback.
6. **test-orchestrator-agents** — depends on (2) and (5) (reuses `LlmProvider`). Planner/Writer/
   PageObject pipeline behind a CLI. Unit-tested with `MockProvider`; live run needs a real key.
7. **reporting** — Allure wiring, depends on (2)/(3) existing so there's something to report on.
8. **ci** — GitHub Actions, depends on (3) and (7) both running green locally first.
9. **postman-collection**, **sql-query** — independent of the TS repo's internals; can be done any
   time, done after (3) so the two "GET a resource" behaviours are already validated once by hand.
10. **docs (README)** — written last, once the real command surface exists, so instructions are
    accurate rather than aspirational.
11. **publish** — git init/commit as we go; create the public GitHub repo early (empty) so commits
    can push incrementally rather than as one giant final commit.

## Risks & mitigations

- **No live Anthropic key in this environment** → self-healing and orchestrator agents must be
  fully exercised via `MockProvider` in unit tests; live-key demos are documented as a manual
  step for the user to run locally, not claimed as verified by this session.
- **Allure classic requires Java** → confirmed available (Java 25) in this environment; documented
  as a prerequisite in the README regardless, since reviewers' machines may differ.
- **Playwright browser download needs network** → confirmed reachable; if CI sandboxing differs,
  `npx playwright install --with-deps` is the documented recovery step.
- **Scope creep vs. the brief's own "small wins" guidance** → explicitly addressed in the README
  Design Decisions section rather than silently ignored.

## Verification checkpoints

- After (2): `npm run typecheck` + `npm run test:unit` green.
- After (3): `npm test` green against real targets.
- After (5)/(6): unit tests green with `MockProvider`; manual note in README for live-key
  verification.
- After (7)/(8): local Allure report opens; CI workflow file validated with `act` or by pushing
  and checking the Actions run.
- Before (11) final push: full `npm run typecheck && npm run lint && npm run test:unit && npm test`
  clean run.
