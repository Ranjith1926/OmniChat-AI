import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo } from 'react';

import { chatActions, conversationsActions, useAppDispatch, useAppState } from '@/context';
import {
  deleteConversation as deleteConversationDb,
  listConversations,
  renameConversation as renameConversationDb,
} from '@/services/db/conversations';

export function useConversations() {
  const db = useSQLiteContext();
  const dispatch = useAppDispatch();
  const { items, searchQuery, isLoading } = useAppState().conversations;

  useEffect(() => {
    (async () => {
      dispatch(conversationsActions.setLoading(true));
      const conversations = await listConversations(db);
      dispatch(conversationsActions.setConversations(conversations));
      dispatch(conversationsActions.setLoading(false));
    })();
  }, [db, dispatch]);

  const conversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;
    return items.filter((conversation) => conversation.title.toLowerCase().includes(query));
  }, [items, searchQuery]);

  const setSearchQuery = useCallback((query: string) => dispatch(conversationsActions.setSearchQuery(query)), [dispatch]);

  const renameConversation = useCallback(
    async (id: string, title: string) => {
      await renameConversationDb(db, id, title);
      const existing = items.find((conversation) => conversation.id === id);
      if (existing) dispatch(conversationsActions.upsertConversation({ ...existing, title }));
    },
    [db, dispatch, items]
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      await deleteConversationDb(db, id);
      dispatch(conversationsActions.deleteConversation(id));
      dispatch(chatActions.clearConversationMessages(id));
    },
    [db, dispatch]
  );

  return { conversations, isLoading, searchQuery, setSearchQuery, renameConversation, deleteConversation };
}
