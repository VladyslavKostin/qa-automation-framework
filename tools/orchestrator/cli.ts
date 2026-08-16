import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { loadConfig } from '@core/config/AppConfig';
import { createLlmProvider } from '@core/agents/LlmProviderFactory';
import { PlannerAgent } from './PlannerAgent';
import { PageObjectAgent } from './PageObjectAgent';
import { WriterAgent } from './WriterAgent';
import { Orchestrator } from './Orchestrator';

async function main(): Promise<void> {
  const scenario = process.argv.slice(2).join(' ').trim();
  if (!scenario) {
    console.error('Usage: npm run generate:test -- "<plain-English scenario>"');
    process.exitCode = 1;
    return;
  }

  const config = loadConfig();
  const provider = createLlmProvider(config.llm);
  const orchestrator = new Orchestrator(
    new PlannerAgent(provider),
    new PageObjectAgent(provider),
    new WriterAgent(provider),
  );

  const result = await orchestrator.generate(scenario);

  for (const file of [result.pageObject, result.spec]) {
    await mkdir(dirname(file.path), { recursive: true });
    await writeFile(file.path, file.content, 'utf-8');
    console.log(`wrote ${file.path}`);
  }

  if (config.llm.provider === 'mock') {
    console.log(
      '\nANTHROPIC_API_KEY is not set, so MockLlmProvider produced an offline skeleton, not ' +
        'scenario-aware code. Set ANTHROPIC_API_KEY and re-run for real generation.',
    );
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
