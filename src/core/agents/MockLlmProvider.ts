import type { LlmMessage, LlmProvider } from './LlmProvider';
import type { CandidateElement } from '@core/healing/CandidateElement';

function extractDescription(prompt: string): string | undefined {
  return prompt.match(/described as "([^"]+)"/)?.[1];
}

function extractCandidates(prompt: string): CandidateElement[] {
  const start = prompt.indexOf('[');
  const end = prompt.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) return [];
  try {
    return JSON.parse(prompt.slice(start, end + 1)) as CandidateElement[];
  } catch {
    return [];
  }
}

function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2);
}

function scoreCandidate(description: string, candidate: CandidateElement): number {
  const target = new Set(words(description));
  const haystack = words([candidate.tag, candidate.text, ...Object.values(candidate.attributes)].join(' '));
  return haystack.filter((word) => target.has(word)).length;
}

/**
 * Deterministic, offline stand-in for a real LLM. It does not "understand" anything — it scores
 * each candidate element (parsed back out of the prompt) against the element's description by
 * keyword overlap. This keeps unit tests and no-API-key runs free, fast, and reproducible; it is
 * selected automatically by `LlmProviderFactory` whenever `ANTHROPIC_API_KEY` is not set.
 */
export class MockLlmProvider implements LlmProvider {
  async complete(messages: LlmMessage[]): Promise<string> {
    const prompt = messages.find((message) => message.role === 'user')?.content ?? '';
    const description = extractDescription(prompt);
    const candidates = extractCandidates(prompt);

    if (!description || candidates.length === 0) {
      return JSON.stringify({ selector: null, reason: 'no candidates to score' });
    }

    const [best] = candidates
      .map((candidate) => ({ candidate, score: scoreCandidate(description, candidate) }))
      .sort((a, b) => b.score - a.score);

    if (!best || best.score === 0) {
      return JSON.stringify({ selector: null, reason: 'no candidate matched the description' });
    }

    return JSON.stringify({
      selector: best.candidate.selector,
      reason: `keyword overlap with description (score ${best.score})`,
    });
  }
}
