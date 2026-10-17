import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';

import { attachmentsActions, chatActions, conversationsActions, useAppDispatch, useAppState } from '@/context';
import { streamChatResponse } from '@/services/api/gemini';
import { insertAttachments } from '@/services/db/attachments';
import { deriveTitle, insertConversation, touchConversation } from '@/services/db/conversations';
import { deleteMessage as deleteMessageDb, deleteMessagesAfter, insertMessage, listMessages, updateMessage as updateMessageDb } from '@/services/db/messages';
import { GUEST_MESSAGE_LIMIT, getGuestMessageCount, grantGuestMessageBonus, incrementGuestMessageCount } from '@/services/storage/guestUsageStorage';
import type { Conversation, Message } from '@/types';
import { generateId } from '@/utils/id';

function createMessage(conversationId: string, role: Message['role'], content: string, status: Message['status']): Message {
  return { id: generateId(), conversationId, role, content, status, createdAt: Date.now() };
}

const EMPTY_MESSAGES: Message[] = [];

export function useChat(conversationId: string) {
  const db = useSQLiteContext();
  const dispatch = useAppDispatch();
  const appState = useAppState();
  const chatState = appState.chat;
  const { model } = appState.settings;
  const conversations = appState.conversations.items;
  const attachments = appState.attachments;
  const messages = chatState.messagesByConversation[conversationId] ?? EMPTY_MESSAGES;
  const isStreaming = chatState.streamingMessageId != null;
  const abortControllerRef = useRef<AbortController | null>(null);
  const isAuthenticated = appState.auth.user != null;
  const [guestMessageCount, setGuestMessageCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) return;
    getGuestMessageCount().then(setGuestMessageCount);
  }, [isAuthenticated]);

  useEffect(() => {
    dispatch(chatActions.setActiveConversation(conversationId));

    if (chatState.messagesByConversation[conversationId] === undefined) {
      listMessages(db, conversationId).then((loaded) => {
        dispatch(chatActions.setMessages(conversationId, loaded));
      });
    }

    return () => {
      abortControllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, db, dispatch]);

  const ensureConversationExists = useCallback(
    async (firstUserMessage: string) => {
      const now = Date.now();
      const conversation: Conversation = {
        id: conversationId,
        title: deriveTitle(firstUserMessage),
        model,
        createdAt: now,
        updatedAt: now,
      };
      await insertConversation(db, conversation);
      dispatch(conversationsActions.upsertConversation(conversation));
    },
    [conversationId, db, dispatch, model]
  );

  const markConversationActivity = useCallback(() => {
    const now = Date.now();
    touchConversation(db, conversationId, now);
    const existing = conversations.find((conversation) => conversation.id === conversationId);
    if (existing) {
      dispatch(conversationsActions.upsertConversation({ ...existing, updatedAt: now }));
    }
  }, [conversationId, conversations, db, dispatch]);

  const runAssistantTurn = useCallback(
    (historyForRequest: Message[], existingAssistantId?: string) => {
      const assistantId = existingAssistantId ?? generateId();

      if (existingAssistantId) {
        dispatch(chatActions.updateMessage(conversationId, assistantId, { content: '', status: 'streaming', error: undefined }));
        updateMessageDb(db, assistantId, { content: '', status: 'streaming', error: null });
      } else {
        const assistantMessage: Message = {
          id: assistantId,
          conversationId,
          role: 'assistant',
          content: '',
          status: 'streaming',
          createdAt: Date.now(),
        };
        dispatch(chatActions.addMessage(conversationId, assistantMessage));
        insertMessage(db, assistantMessage);
      }
      dispatch(chatActions.setStreamingMessage(assistantId));
      dispatch(chatActions.setError(null));

      const controller = new AbortController();
      abortControllerRef.current = controller;
      let accumulated = '';

      streamChatResponse({
        model,
        messages: historyForRequest,
        signal: controller.signal,
        onDelta: (delta) => {
          accumulated += delta;
          dispatch(chatActions.updateMessage(conversationId, assistantId, { content: accumulated }));
        },
        onDone: () => {
          dispatch(chatActions.updateMessage(conversationId, assistantId, { status: 'complete' }));
          dispatch(chatActions.setStreamingMessage(null));
          updateMessageDb(db, assistantId, { content: accumulated, status: 'complete', error: null });
          markConversationActivity();
          abortControllerRef.current = null;
        },
        onError: (err) => {
          dispatch(chatActions.updateMessage(conversationId, assistantId, { status: 'error', error: err.message }));
          dispatch(chatActions.setStreamingMessage(null));
          dispatch(chatActions.setError(err.message));
          updateMessageDb(db, assistantId, { content: accumulated, status: 'error', error: err.message });
          abortControllerRef.current = null;
        },
      });
    },
    [conversationId, db, dispatch, markConversationActivity, model]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      const readyAttachments = attachments.pending.filter((attachment) => attachment.status === 'ready');
      if ((!trimmed && readyAttachments.length === 0) || isStreaming) return;
      if (!isAuthenticated && guestMessageCount >= GUEST_MESSAGE_LIMIT) return;

      if (messages.length === 0) {
        await ensureConversationExists(trimmed || readyAttachments[0]?.name || '');
      }

      const userMessage: Message = {
        ...createMessage(conversationId, 'user', trimmed, 'complete'),
        attachments: readyAttachments.length > 0 ? readyAttachments : undefined,
      };
      dispatch(chatActions.addMessage(conversationId, userMessage));
      dispatch(attachmentsActions.clearAttachments());
      await insertMessage(db, userMessage);
      if (readyAttachments.length > 0) {
        await insertAttachments(db, userMessage.id, readyAttachments);
      }
      if (!isAuthenticated) {
        setGuestMessageCount(await incrementGuestMessageCount());
      }
      runAssistantTurn([...messages, userMessage]);
    },
    [attachments.pending, conversationId, db, dispatch, ensureConversationExists, guestMessageCount, isAuthenticated, isStreaming, messages, runAssistantTurn]
  );

  const stopGeneration = useCallback(() => {
    const streamingId = chatState.streamingMessageId;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    if (streamingId) {
      const current = messages.find((message) => message.id === streamingId);
      dispatch(chatActions.updateMessage(conversationId, streamingId, { status: 'complete' }));
      dispatch(chatActions.setStreamingMessage(null));
      updateMessageDb(db, streamingId, { content: current?.content ?? '', status: 'complete', error: null });
    }
  }, [chatState.streamingMessageId, conversationId, db, dispatch, messages]);

  const regenerateMessage = useCallback(
    (assistantMessageId: string) => {
      if (isStreaming) return;
      const index = messages.findIndex((message) => message.id === assistantMessageId);
      if (index === -1) return;
      const historyBefore = messages.slice(0, index);
      runAssistantTurn(historyBefore, assistantMessageId);
    },
    [isStreaming, messages, runAssistantTurn]
  );

  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (isStreaming) return;
      const index = messages.findIndex((message) => message.id === messageId);
      if (index === -1) return;

      const updated = { ...messages[index], content: newContent };
      dispatch(chatActions.updateMessage(conversationId, messageId, { content: newContent }));
      await updateMessageDb(db, messageId, { content: newContent });

      const trailing = messages.slice(index + 1);
      for (const message of trailing) {
        dispatch(chatActions.deleteMessage(conversationId, message.id));
      }
      await deleteMessagesAfter(db, conversationId, updated.createdAt);

      runAssistantTurn([...messages.slice(0, index), updated]);
    },
    [conversationId, db, dispatch, isStreaming, messages, runAssistantTurn]
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      dispatch(chatActions.deleteMessage(conversationId, messageId));
      deleteMessageDb(db, messageId);
    },
    [conversationId, db, dispatch]
  );

  const claimGuestBonus = useCallback(async (amount: number) => {
    setGuestMessageCount(await grantGuestMessageBonus(amount));
  }, []);

  const retryLastError = useCallback(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role === 'assistant' && last.status === 'error') {
      regenerateMessage(last.id);
    }
  }, [messages, regenerateMessage]);

  return {
    messages,
    isStreaming,
    error: chatState.error,
    sendMessage,
    stopGeneration,
    regenerateMessage,
    editMessage,
    deleteMessage,
    retryLastError,
    isAuthenticated,
    guestMessagesRemaining: Math.max(0, GUEST_MESSAGE_LIMIT - guestMessageCount),
    guestLimitReached: !isAuthenticated && guestMessageCount >= GUEST_MESSAGE_LIMIT,
    claimGuestBonus,
  };
}
