import type { Attachment } from './attachment';

export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  attachments?: Attachment[];
  status: MessageStatus;
  error?: string;
  createdAt: number;
}
