import { toKebabCase } from './naming';
import type { PlannerAgent } from './PlannerAgent';
import type { PageObjectAgent } from './PageObjectAgent';
import type { WriterAgent } from './WriterAgent';
import type { GenerationResult } from './types';

/** Pipeline (Chain of Responsibility): Planner -> PageObjectAgent -> WriterAgent. */
export class Orchestrator {
  constructor(
    private readonly planner: PlannerAgent,
    private readonly pageObjectAgent: PageObjectAgent,
    private readonly writerAgent: WriterAgent,
  ) {}

  async generate(scenario: string): Promise<GenerationResult> {
    const plan = await this.planner.plan(scenario);

    const slug = toKebabCase(plan.title);
    const pageObjectPath = `src/pages/generated/${plan.pageObjectName}.ts`;
    const pageObjectImportPath = `@pages/generated/${plan.pageObjectName}`;
    const specPath = `tests/ui/generated/${slug}.spec.ts`;

    const pageObjectContent = await this.pageObjectAgent.write(plan);
    const specContent = await this.writerAgent.write(plan, pageObjectImportPath);

    return {
      plan,
      pageObject: { path: pageObjectPath, content: pageObjectContent },
      spec: { path: specPath, content: specContent },
    };
  }
}
