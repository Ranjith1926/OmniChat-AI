export type AttachmentKind = 'image' | 'document' | 'audio';

export type AttachmentStatus = 'staged' | 'processing' | 'ready' | 'error';

export interface Attachment {
  id: string;
  kind: AttachmentKind;
  uri: string;
  name: string;
  mimeType: string;
  size: number;
  status: AttachmentStatus;
  /** Locally-extracted text content, for document attachments (txt/csv/docx). */
  extractedText?: string;
  error?: string;
}
