---
name: qa-test-planner
description: Turns a plain-English QA scenario into a structured test plan for the qa-automation-framework repo (Playwright + TypeScript). Use when asked to plan a new UI or API test for this framework, or to decide what page objects, elements, entities, and test data it needs before writing any code.
---

# QA Test Planner

## Overview

First stage of a three-skill pipeline for adding tests to this repo:
**qa-test-planner → qa-page-object-writer → qa-test-writer** (or invoke all three via
`qa-generate-test`). This skill turns a scenario like *"As a user, I can remove an item from the
cart"* into a concrete, reviewable plan — before any file gets written.

Self-healing locators are a separate, runtime concern (`src/core/healing/`) — they run
automatically inside a live test when a selector breaks, and are not part of this planning flow.

## What to gather

1. **The scenario**, restated as a one-line title and, if it isn't obvious, the acceptance
   criteria (what must be true when it passes).
2. **Layer** — UI (`tests/ui/`) or API (`tests/api/`).
3. **Target page(s) / endpoint(s)** — check what already exists before assuming something new is
   needed:
   - Existing SauceDemo page objects (`src/pages/sauce-demo/`): `LoginPage`, `InventoryPage`,
     `CartPage`, `CheckoutStepOnePage`, `CheckoutOverviewPage`, `CheckoutCompletePage`.
   - Existing entities (`src/entities/`): `Post`, `CheckoutInfo`.
   - Existing test-data builders (`src/testdata/`): `CheckoutInfoBuilder`.
   - If the scenario needs a page/element/entity/builder that doesn't exist yet, say so
     explicitly in the plan rather than silently assuming it's there.
4. **The chain of actions** — numbered, in the same granularity as
   `test.step()` blocks (see `qa-test-writer`), e.g.:
   1. Log in as a standard user
   2. Add the backpack to the cart
   3. Open the cart and remove it
   4. Verify the cart is empty
5. **Assertions** — one per step where it matters, stated concretely (e.g. "cart badge is not
   visible", not "cart is updated").
6. **Test data** — does this scenario need generated data (names, addresses, emails)? If so, does
   an existing builder in `src/testdata/` already cover it, or does a new one need to be added
   (Builder pattern, pre-filled with `@faker-js/faker` defaults, `with*()` overrides — see
   `CheckoutInfoBuilder` as the reference shape)?

## Output

A short markdown plan with the sections above. Hand it to **qa-page-object-writer** if any page
object needs to be created or extended, then to **qa-test-writer** to produce the spec file. If no
new page object is needed, skip straight to **qa-test-writer**.

## Boundaries

- Don't invent selectors here — that's `qa-page-object-writer`'s job, and it needs to inspect the
  real page (via the Playwright MCP server configured in `.mcp.json`) rather than guess.
- Don't write any code in this step. A plan that turns out to be wrong is cheap to fix; a wrong
  page object or spec is not.
