import JSZip from 'jszip';

const XML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

function decodeXmlEntities(text: string): string {
  return text.replace(/&(amp|lt|gt|quot|apos);/g, (_match, entity) => XML_ENTITIES[entity]);
}

/**
 * Pulls plain text out of a .docx's word/document.xml. This is a best-effort
 * extraction (paragraph text only, via a direct regex over <w:t>/<w:p> tags) —
 * it doesn't attempt tables, headers/footers, or styling fidelity.
 */
export async function extractDocxText(base64: string): Promise<string> {
  const zip = await JSZip.loadAsync(base64, { base64: true });
  const documentXmlFile = zip.file('word/document.xml');
  if (!documentXmlFile) {
    throw new Error('This file doesn’t look like a valid .docx (missing word/document.xml).');
  }

  const xml = await documentXmlFile.async('string');

  const paragraphs = xml.split(/<\/w:p>/);
  const lines = paragraphs.map((paragraph) => {
    const matches = paragraph.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) ?? [];
    return matches.map((match) => decodeXmlEntities(match.replace(/<w:t[^>]*>|<\/w:t>/g, ''))).join('');
  });

  const text = lines.filter((line) => line.length > 0).join('\n').trim();
  if (!text) {
    throw new Error('No readable text found in this document.');
  }
  return text;
}
