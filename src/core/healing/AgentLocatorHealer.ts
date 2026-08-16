import type { LlmProvider } from '@core/agents/LlmProvider';
import type { CandidateElement } from './CandidateElement';
import type { HealRequest, HealResult, LocatorHealer } from './LocatorHealer';
import { captureCandidates } from './DomSnapshot';

const SYSTEM_PROMPT =
  'You repair broken Playwright locators. Given an element description, the selector that just ' +
  'failed, and a list of candidate elements currently on the page, pick the single best-matching ' +
  'candidate. Reply with strict JSON only, no prose.';

interface HealingReply {
  selector?: string | null;
  reason?: string;
}

/** `LocatorHealer` implementation backed by an `LlmProvider` (real or mock). */
export class AgentLocatorHealer implements LocatorHealer {
  constructor(private readonly provider: LlmProvider) {}

  async heal(request: HealRequest): Promise<HealResult | undefined> {
    const candidates = await captureCandidates(request.page);
    if (candidates.length === 0) return undefined;

    const raw = await this.provider.complete([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: this.buildPrompt(request, candidates) },
    ]);

    const parsed = this.parse(raw);
    if (!parsed?.selector) return undefined;

    return { selector: parsed.selector, reason: parsed.reason ?? 'agent-proposed replacement' };
  }

  private buildPrompt(request: HealRequest, candidates: CandidateElement[]): string {
    return [
      `The element described as "${request.descriptor.description}" could not be found using ` +
        `the selector "${request.descriptor.selector}".`,
      `Error: ${String(request.error)}`,
      'Candidate elements currently on the page (JSON):',
      JSON.stringify(candidates, null, 2),
      'Reply with strict JSON: {"selector": "<best matching selector from the candidates, or ' +
        'null if none match>", "reason": "<why>"}.',
    ].join('\n\n');
  }

  private parse(raw: string): HealingReply | undefined {
    try {
      return JSON.parse(raw) as HealingReply;
    } catch {
      return undefined;
    }
  }
}
