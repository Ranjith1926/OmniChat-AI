import { useCallback, useEffect, useRef } from 'react';

import { chatActions, useAppDispatch, useAppState } from '@/context';
import { streamChatResponse } from '@/services/api/gemini';
import type { Message } from '@/types';
import { generateId } from '@/utils/id';

function createMessage(conversationId: string, role: Message['role'], content: string, status: Message['status']): Message {
  return { id: generateId(), conversationId, role, content, status, createdAt: Date.now() };
}

const EMPTY_MESSAGES: Message[] = [];

export function useChat(conversationId: string) {
  const dispatch = useAppDispatch();
  const chatState = useAppState().chat;
  const model = useAppState().settings.model;
  const messages = chatState.messagesByConversation[conversationId] ?? EMPTY_MESSAGES;
  const isStreaming = chatState.streamingMessageId != null;
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    dispatch(chatActions.setActiveConversation(conversationId));
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [conversationId, dispatch]);

  const runAssistantTurn = useCallback(
    (historyForRequest: Message[], existingAssistantId?: string) => {
      const assistantId = existingAssistantId ?? generateId();

      if (existingAssistantId) {
        dispatch(chatActions.updateMessage(conversationId, assistantId, { content: '', status: 'streaming', error: undefined }));
      } else {
        dispatch(
          chatActions.addMessage(conversationId, {
            id: assistantId,
            conversationId,
            role: 'assistant',
            content: '',
            status: 'streaming',
            createdAt: Date.now(),
          })
        );
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
          abortControllerRef.current = null;
        },
        onError: (err) => {
          dispatch(chatActions.updateMessage(conversationId, assistantId, { status: 'error', error: err.message }));
          dispatch(chatActions.setStreamingMessage(null));
          dispatch(chatActions.setError(err.message));
          abortControllerRef.current = null;
        },
      });
    },
    [conversationId, dispatch, model]
  );

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming) return;

      const userMessage = createMessage(conversationId, 'user', trimmed, 'complete');
      dispatch(chatActions.addMessage(conversationId, userMessage));
      runAssistantTurn([...messages, userMessage]);
    },
    [conversationId, dispatch, isStreaming, messages, runAssistantTurn]
  );

  const stopGeneration = useCallback(() => {
    const streamingId = chatState.streamingMessageId;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    if (streamingId) {
      dispatch(chatActions.updateMessage(conversationId, streamingId, { status: 'complete' }));
      dispatch(chatActions.setStreamingMessage(null));
    }
  }, [chatState.streamingMessageId, conversationId, dispatch]);

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
    (messageId: string, newContent: string) => {
      if (isStreaming) return;
      const index = messages.findIndex((message) => message.id === messageId);
      if (index === -1) return;

      const updated = { ...messages[index], content: newContent };
      dispatch(chatActions.updateMessage(conversationId, messageId, { content: newContent }));

      // Resubmit: drop everything after the edited message and get a fresh reply.
      const trailing = messages.slice(index + 1);
      for (const message of trailing) {
        dispatch(chatActions.deleteMessage(conversationId, message.id));
      }
      runAssistantTurn([...messages.slice(0, index), updated]);
    },
    [conversationId, dispatch, isStreaming, messages, runAssistantTurn]
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      dispatch(chatActions.deleteMessage(conversationId, messageId));
    },
    [conversationId, dispatch]
  );

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
  };
}
