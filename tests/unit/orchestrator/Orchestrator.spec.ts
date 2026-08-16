import { describe, expect, it } from 'vitest';
import { MockLlmProvider } from '@core/agents/MockLlmProvider';
import { PlannerAgent } from '../../../tools/orchestrator/PlannerAgent';
import { PageObjectAgent } from '../../../tools/orchestrator/PageObjectAgent';
import { WriterAgent } from '../../../tools/orchestrator/WriterAgent';
import { Orchestrator } from '../../../tools/orchestrator/Orchestrator';

describe('Orchestrator', () => {
  it('runs the full Planner -> PageObjectAgent -> WriterAgent pipeline offline with MockLlmProvider', async () => {
    const provider = new MockLlmProvider();
    const orchestrator = new Orchestrator(
      new PlannerAgent(provider),
      new PageObjectAgent(provider),
      new WriterAgent(provider),
    );

    const result = await orchestrator.generate('Remove an item from the cart');

    expect(result.plan.pageObjectName).toBe('RemoveAnItemFromTheCartPage');
    expect(result.pageObject.path).toBe('src/pages/generated/RemoveAnItemFromTheCartPage.ts');
    expect(result.pageObject.content).toContain('export class RemoveAnItemFromTheCartPage extends BasePage');
    expect(result.spec.path).toBe('tests/ui/generated/remove-an-item-from-the-cart.spec.ts');
    expect(result.spec.content).toContain(
      "import { RemoveAnItemFromTheCartPage } from '@pages/generated/RemoveAnItemFromTheCartPage';",
    );
  });
});
