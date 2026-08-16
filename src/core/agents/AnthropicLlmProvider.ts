import Anthropic from '@anthropic-ai/sdk';
import type { LlmMessage, LlmProvider } from './LlmProvider';

/** Real provider — used whenever `ANTHROPIC_API_KEY` is configured (see `LlmProviderFactory`). */
export class AnthropicLlmProvider implements LlmProvider {
  private readonly client: Anthropic;

  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(messages: LlmMessage[]): Promise<string> {
    const system = messages.find((message) => message.role === 'system')?.content;
    const userMessages = messages.filter((message) => message.role === 'user');

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      ...(system ? { system } : {}),
      messages: userMessages.map((message) => ({ role: 'user' as const, content: message.content })),
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    return textBlock && textBlock.type === 'text' ? textBlock.text : '';
  }
}
