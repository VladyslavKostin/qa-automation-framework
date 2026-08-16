---
name: qa-generate-test
description: Generates a new end-to-end UI or API test for the qa-automation-framework repo from a plain-English scenario, running the plan/page-object/write pipeline end to end. Use when asked to add or create a new test for this framework and you want the full pipeline rather than a single stage.
---

# QA Generate Test

## Overview

This is the "test orchestrator" for the qa-automation-framework repo — deliberately implemented
as three chained skills rather than a standalone program that calls an LLM API at runtime. A
skill runs *as Claude*, inside the same session that already has full repo context, can read the
real target page, and can be corrected mid-flight; a separate CLI tool calling an API would just
be reimplementing a worse version of that. (Contrast this with self-healing locators in
`src/core/healing/` — those run automatically inside a live, unattended test process, which is
exactly the situation that *does* need real runtime code and an `LlmProvider`, not a skill.)

## Pipeline

Given a scenario (e.g. *"As a user, I can remove an item from the cart"*), run in order:

1. **qa-test-planner** — turn the scenario into a plan (target page(s), chain of actions,
   assertions, test-data needs). Stop and confirm the plan with the human if anything about the
   target page or expected behavior is genuinely unclear — don't guess.
2. **qa-page-object-writer** — only if the plan calls for a new or changed page object. Skip this
   stage entirely if the plan only needs page objects that already exist.
3. **qa-test-writer** — produce the `.spec.ts` file from the plan (and whatever page objects now
   exist).

Then verify: `npm run typecheck` and `npx playwright test <the new spec>` against the real target.
A generated test that doesn't compile or doesn't pass isn't done — fix it before reporting success.

## When to use this vs. a single stage

Use this skill for "add a new test for X". Invoke `qa-page-object-writer` or `qa-test-writer`
directly when only that one stage's output is needed (e.g. a page object is missing but the spec
already exists, or vice versa).
