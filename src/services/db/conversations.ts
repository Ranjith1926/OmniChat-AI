import type { SQLiteDatabase } from 'expo-sqlite';

import type { Conversation } from '@/types';

interface ConversationRow {
  id: string;
  title: string;
  model: string;
  created_at: number;
  updated_at: number;
}

function fromRow(row: ConversationRow): Conversation {
  return { id: row.id, title: row.title, model: row.model, createdAt: row.created_at, updatedAt: row.updated_at };
}

export async function listConversations(db: SQLiteDatabase): Promise<Conversation[]> {
  const rows = await db.getAllAsync<ConversationRow>('SELECT * FROM conversations ORDER BY updated_at DESC');
  return rows.map(fromRow);
}

export async function insertConversation(db: SQLiteDatabase, conversation: Conversation): Promise<void> {
  await db.runAsync(
    'INSERT INTO conversations (id, title, model, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    conversation.id,
    conversation.title,
    conversation.model,
    conversation.createdAt,
    conversation.updatedAt
  );
}

export async function touchConversation(db: SQLiteDatabase, id: string, updatedAt: number): Promise<void> {
  await db.runAsync('UPDATE conversations SET updated_at = ? WHERE id = ?', updatedAt, id);
}

export async function renameConversation(db: SQLiteDatabase, id: string, title: string): Promise<void> {
  await db.runAsync('UPDATE conversations SET title = ? WHERE id = ?', title, id);
}

export async function deleteConversation(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM conversations WHERE id = ?', id);
}

export function deriveTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim().replace(/\s+/g, ' ');
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed || 'New chat';
}
