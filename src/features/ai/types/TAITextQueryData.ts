import { AIMessageChunk } from '@langchain/core/messages';

export type TAITextQueryData = { content: AIMessageChunk['content'] } & Partial<
  Pick<
    AIMessageChunk,
    | 'usage_metadata'
    | 'name'
    | 'additional_kwargs'
    | 'response_metadata'
    | 'id'
    | 'tool_calls'
    | 'invalid_tool_calls'
  >
>;
