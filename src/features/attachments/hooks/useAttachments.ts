import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback } from 'react';

import { attachmentsActions, useAppDispatch, useAppState } from '@/context';
import {
  MAX_DOCX_BYTES,
  MAX_PDF_BYTES,
  MAX_TEXT_BYTES,
  PDF_MIME,
  SUPPORTED_DOCUMENT_MIME_TYPES,
  TEXT_MIME_TYPES,
} from '@/services/documents/constants';
import { extractDocumentText, readPickedFileAsBase64 } from '@/services/documents/textExtract';
import { MAX_SOURCE_BYTES, deleteImageFile, processImage } from '@/services/media/imageProcessing';
import { deleteStoredFile, writeBase64ToPermanentStorage } from '@/services/storage/permanentFile';
import type { Attachment } from '@/types';
import { generateId } from '@/utils/id';

function extensionFor(name: string): string {
  const dotIndex = name.lastIndexOf('.');
  return dotIndex === -1 ? '' : name.slice(dotIndex);
}

function maxBytesFor(mimeType: string): number {
  if (mimeType === PDF_MIME) return MAX_PDF_BYTES;
  if (TEXT_MIME_TYPES.includes(mimeType)) return MAX_TEXT_BYTES;
  return MAX_DOCX_BYTES;
}

export function useAttachments() {
  const dispatch = useAppDispatch();
  const pending = useAppState().attachments.pending;

  const addProcessedImage = useCallback(
    async (sourceUri: string, name: string) => {
      const staged: Attachment = {
        id: generateId(),
        kind: 'image',
        uri: sourceUri,
        name,
        mimeType: 'image/jpeg',
        size: 0,
        status: 'processing',
      };
      dispatch(attachmentsActions.addAttachment(staged));

      try {
        const processed = await processImage(sourceUri);
        dispatch(
          attachmentsActions.updateAttachment(staged.id, {
            uri: processed.uri,
            mimeType: processed.mimeType,
            size: processed.size,
            status: 'ready',
          })
        );
      } catch (err) {
        dispatch(
          attachmentsActions.updateAttachment(staged.id, {
            status: 'error',
            error: err instanceof Error ? err.message : 'Could not process this image.',
          })
        );
      }
    },
    [dispatch]
  );

  const pickFromLibrary = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      dispatch(attachmentsActions.addAttachment({
        id: generateId(),
        kind: 'image',
        uri: '',
        name: 'Photo library',
        mimeType: 'image/jpeg',
        size: 0,
        status: 'error',
        error: 'Photo library access was denied. Enable it in system settings to add images.',
      }));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 6,
      quality: 1,
    });
    if (result.canceled) return;

    for (const asset of result.assets) {
      if (asset.fileSize && asset.fileSize > MAX_SOURCE_BYTES) {
        dispatch(
          attachmentsActions.addAttachment({
            id: generateId(),
            kind: 'image',
            uri: asset.uri,
            name: asset.fileName ?? 'Image',
            mimeType: asset.mimeType ?? 'image/jpeg',
            size: asset.fileSize,
            status: 'error',
            error: 'This image is too large (over 25 MB).',
          })
        );
        continue;
      }
      await addProcessedImage(asset.uri, asset.fileName ?? 'Image');
    }
  }, [addProcessedImage, dispatch]);

  const pickDocuments = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: SUPPORTED_DOCUMENT_MIME_TYPES,
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    for (const asset of result.assets) {
      const mimeType = asset.mimeType ?? '';
      const staged: Attachment = {
        id: generateId(),
        kind: 'document',
        uri: asset.uri,
        name: asset.name,
        mimeType,
        size: asset.size ?? 0,
        status: 'processing',
      };

      if (!SUPPORTED_DOCUMENT_MIME_TYPES.includes(mimeType)) {
        dispatch(
          attachmentsActions.addAttachment({
            ...staged,
            status: 'error',
            error: 'Unsupported file type. Use PDF, TXT, CSV, or DOCX.',
          })
        );
        continue;
      }
      if (asset.size && asset.size > maxBytesFor(mimeType)) {
        dispatch(
          attachmentsActions.addAttachment({
            ...staged,
            status: 'error',
            error: `This file is too large (over ${Math.round(maxBytesFor(mimeType) / (1024 * 1024))} MB).`,
          })
        );
        continue;
      }

      dispatch(attachmentsActions.addAttachment(staged));

      try {
        if (mimeType === PDF_MIME) {
          // PDFs are re-read and sent on every request, so they need a stable
          // permanent copy. File.copy() can't read the picker's content:// URI
          // directly (SAF read-permission limitation), so read the bytes
          // ourselves and write them into a new file instead.
          const base64 = await readPickedFileAsBase64(asset.uri);
          const stored = await writeBase64ToPermanentStorage(base64, extensionFor(asset.name));
          dispatch(attachmentsActions.updateAttachment(staged.id, { uri: stored.uri, size: stored.size, status: 'ready' }));
        } else {
          // TXT/CSV/DOCX only need their extracted text going forward — no need
          // to persist the original file.
          const extractedText = await extractDocumentText(asset.uri, mimeType);
          dispatch(attachmentsActions.updateAttachment(staged.id, { status: 'ready', extractedText }));
        }
      } catch (err) {
        dispatch(
          attachmentsActions.updateAttachment(staged.id, {
            status: 'error',
            error: err instanceof Error ? err.message : 'Could not read this file.',
          })
        );
      }
    }
  }, [dispatch]);

  const openCamera = useCallback(() => {
    router.push('/camera');
  }, []);

  const removeAttachment = useCallback(
    (id: string) => {
      const attachment = pending.find((item) => item.id === id);
      dispatch(attachmentsActions.removeAttachment(id));
      if (attachment?.status === 'ready' && attachment.uri) {
        if (attachment.kind === 'image') {
          deleteImageFile(attachment.uri);
        } else {
          deleteStoredFile(attachment.uri);
        }
      }
    },
    [dispatch, pending]
  );

  const clearAttachments = useCallback(() => dispatch(attachmentsActions.clearAttachments()), [dispatch]);

  return { pending, pickFromLibrary, pickDocuments, openCamera, removeAttachment, clearAttachments, addProcessedImage };
}
