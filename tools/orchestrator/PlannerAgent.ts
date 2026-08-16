import type { LlmProvider } from '@core/agents/LlmProvider';
import type { TestPlan } from './types';
import { toPascalCase } from './naming';

const SYSTEM_PROMPT =
  'You are a QA test planner for a Playwright + TypeScript framework. Given a plain-English ' +
  'scenario, produce a short, testable plan. Reply with strict JSON only, no prose.';

/**
 * First stage of the orchestrator pipeline. Treats the LLM reply as untrusted: a malformed or
 * incomplete reply (including everything `MockLlmProvider` returns, since it was never designed
 * to answer this prompt) falls back to a deterministic plan derived straight from the scenario
 * text, rather than throwing. The same fallback would also protect a live Anthropic run against
 * an occasional bad reply.
 */
export class PlannerAgent {
  constructor(private readonly provider: LlmProvider) {}

  async plan(scenario: string): Promise<TestPlan> {
    const raw = await this.provider.complete([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: this.buildPrompt(scenario) },
    ]);
    return this.parse(raw, scenario);
  }

  private buildPrompt(scenario: string): string {
    return [
      'TASK: generate-test-plan',
      `Scenario: "${scenario}"`,
      'Reply with strict JSON: {"title": "...", "pageObjectName": "PascalCasePageName", ' +
        '"steps": ["..."], "assertions": ["..."]}.',
    ].join('\n\n');
  }

  private parse(raw: string, scenario: string): TestPlan {
    try {
      const parsed = JSON.parse(raw) as Partial<TestPlan>;
      if (
        !parsed.title ||
        !parsed.pageObjectName ||
        !Array.isArray(parsed.steps) ||
        !Array.isArray(parsed.assertions) ||
        parsed.steps.length === 0
      ) {
        throw new Error('incomplete plan');
      }
      return {
        title: parsed.title,
        pageObjectName: parsed.pageObjectName,
        steps: parsed.steps,
        assertions: parsed.assertions,
      };
    } catch {
      return {
        title: scenario,
        pageObjectName: `${toPascalCase(scenario)}Page`,
        steps: [`Perform: ${scenario}`],
        assertions: [`Assert the expected outcome of: ${scenario}`],
      };
    }
  }
}
