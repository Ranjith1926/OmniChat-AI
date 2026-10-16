import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback } from 'react';

import { attachmentsActions, useAppDispatch, useAppState } from '@/context';
import { MAX_SOURCE_BYTES, deleteImageFile, processImage } from '@/services/media/imageProcessing';
import type { Attachment } from '@/types';
import { generateId } from '@/utils/id';

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

  const openCamera = useCallback(() => {
    router.push('/camera');
  }, []);

  const removeAttachment = useCallback(
    (id: string) => {
      const attachment = pending.find((item) => item.id === id);
      dispatch(attachmentsActions.removeAttachment(id));
      if (attachment?.status === 'ready' && attachment.uri) {
        deleteImageFile(attachment.uri);
      }
    },
    [dispatch, pending]
  );

  const clearAttachments = useCallback(() => dispatch(attachmentsActions.clearAttachments()), [dispatch]);

  return { pending, pickFromLibrary, openCamera, removeAttachment, clearAttachments, addProcessedImage };
}
