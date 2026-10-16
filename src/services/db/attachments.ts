import type { SQLiteDatabase } from 'expo-sqlite';

import type { Attachment } from '@/types';

interface AttachmentRow {
  id: string;
  message_id: string;
  kind: string;
  uri: string;
  name: string;
  mime_type: string;
  size: number;
  extracted_text: string | null;
}

function fromRow(row: AttachmentRow): Attachment {
  return {
    id: row.id,
    kind: row.kind as Attachment['kind'],
    uri: row.uri,
    name: row.name,
    mimeType: row.mime_type,
    size: row.size,
    status: 'ready',
    extractedText: row.extracted_text ?? undefined,
  };
}

export async function insertAttachments(db: SQLiteDatabase, messageId: string, attachments: Attachment[]): Promise<void> {
  for (const attachment of attachments) {
    await db.runAsync(
      'INSERT INTO attachments (id, message_id, kind, uri, name, mime_type, size, extracted_text, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      attachment.id,
      messageId,
      attachment.kind,
      attachment.uri,
      attachment.name,
      attachment.mimeType,
      attachment.size,
      attachment.extractedText ?? null,
      Date.now()
    );
  }
}

export async function listAttachmentsForMessages(db: SQLiteDatabase, messageIds: string[]): Promise<Map<string, Attachment[]>> {
  const byMessage = new Map<string, Attachment[]>();
  if (messageIds.length === 0) return byMessage;

  const placeholders = messageIds.map(() => '?').join(', ');
  const rows = await db.getAllAsync<AttachmentRow>(
    `SELECT * FROM attachments WHERE message_id IN (${placeholders}) ORDER BY created_at ASC`,
    ...messageIds
  );

  for (const row of rows) {
    const list = byMessage.get(row.message_id) ?? [];
    list.push(fromRow(row));
    byMessage.set(row.message_id, list);
  }
  return byMessage;
}
