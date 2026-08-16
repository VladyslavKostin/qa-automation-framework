export interface LlmMessage {
  readonly role: 'system' | 'user';
  readonly content: string;
}

/**
 * Strategy interface shared by the self-healing agent and the test-orchestrator agents. Both
 * pick a concrete implementation via `LlmProviderFactory` — never construct one directly — so
 * swapping providers (or falling back to the offline mock) never touches call sites.
 */
export interface LlmProvider {
  complete(messages: LlmMessage[]): Promise<string>;
}
