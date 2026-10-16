import type { SQLiteDatabase } from 'expo-sqlite';

import { listAttachmentsForMessages } from './attachments';
import type { Message } from '@/types';

interface MessageRow {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  status: string;
  error: string | null;
  created_at: number;
}

function fromRow(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role as Message['role'],
    content: row.content,
    status: row.status as Message['status'],
    error: row.error ?? undefined,
    createdAt: row.created_at,
  };
}

export async function listMessages(db: SQLiteDatabase, conversationId: string): Promise<Message[]> {
  const rows = await db.getAllAsync<MessageRow>(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
    conversationId
  );
  const attachmentsByMessage = await listAttachmentsForMessages(db, rows.map((row) => row.id));

  return rows.map((row) => {
    const message = fromRow(row);
    const attachments = attachmentsByMessage.get(row.id);
    return attachments ? { ...message, attachments } : message;
  });
}

export async function insertMessage(db: SQLiteDatabase, message: Message): Promise<void> {
  await db.runAsync(
    'INSERT INTO messages (id, conversation_id, role, content, status, error, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    message.id,
    message.conversationId,
    message.role,
    message.content,
    message.status,
    message.error ?? null,
    message.createdAt
  );
}

export interface MessageUpdate {
  content?: string;
  status?: Message['status'];
  /** undefined = leave untouched, null = clear the stored error. */
  error?: string | null;
}

export async function updateMessage(db: SQLiteDatabase, id: string, changes: MessageUpdate): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (changes.content !== undefined) {
    fields.push('content = ?');
    values.push(changes.content);
  }
  if (changes.status !== undefined) {
    fields.push('status = ?');
    values.push(changes.status);
  }
  if (changes.error !== undefined) {
    fields.push('error = ?');
    values.push(changes.error ?? null);
  }
  if (fields.length === 0) return;

  values.push(id);
  await db.runAsync(`UPDATE messages SET ${fields.join(', ')} WHERE id = ?`, ...values);
}

export async function deleteMessage(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM messages WHERE id = ?', id);
}

export async function deleteMessagesAfter(db: SQLiteDatabase, conversationId: string, createdAt: number): Promise<void> {
  await db.runAsync(
    'DELETE FROM messages WHERE conversation_id = ? AND created_at > ?',
    conversationId,
    createdAt
  );
}
