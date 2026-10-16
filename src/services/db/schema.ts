import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'omnichat.db';

const MIGRATIONS: ((db: SQLiteDatabase) => Promise<void>)[] = [
  // v1: conversations, messages, key-value app_settings
  async (db) => {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        model TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY NOT NULL,
        conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT NOT NULL,
        error TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
  },
  // v2: attachments (images for now; documents/audio join the same table in later phases)
  async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY NOT NULL,
        message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        kind TEXT NOT NULL,
        uri TEXT NOT NULL,
        name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        extracted_text TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_attachments_message ON attachments(message_id);
    `);
  },
];

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  let { user_version: currentVersion } = (await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  )) ?? { user_version: 0 };

  while (currentVersion < MIGRATIONS.length) {
    await MIGRATIONS[currentVersion](db);
    currentVersion += 1;
    await db.execAsync(`PRAGMA user_version = ${currentVersion}`);
  }
}
