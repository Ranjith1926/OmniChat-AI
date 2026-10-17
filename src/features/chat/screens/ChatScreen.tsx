import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import type { DrawerNavigationProp } from 'expo-router/drawer';
import { Menu, SquarePen, Sparkles } from 'lucide-react-native';
import { useRef } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { IconButton } from '@/components/atoms';
import { BannerAdView, EmptyState, ErrorState, GuestLimitBanner } from '@/components/molecules';
import { Composer, MessageBubble } from '@/components/organisms';
import { Screen } from '@/components/templates/Screen';
import { useChat } from '@/features/chat/hooks/useChat';
import { useRewardedAd } from '@/features/ads/hooks/useRewardedAd';
import { REWARDED_MESSAGE_BONUS } from '@/services/ads/adsConfig';
import { showInterstitialIfReady } from '@/services/ads/interstitialAd';
import type { Message } from '@/types';
import { generateId } from '@/utils/id';

export function ChatScreen() {
  const theme = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = id ?? 'new';
  const navigation = useNavigation<DrawerNavigationProp<Record<string, object | undefined>>>();
  const {
    messages,
    isStreaming,
    error,
    sendMessage,
    stopGeneration,
    regenerateMessage,
    editMessage,
    deleteMessage,
    retryLastError,
    guestLimitReached,
    claimGuestBonus,
  } = useChat(conversationId);
  const listRef = useRef<FlatList<Message>>(null);
  const rewardedAd = useRewardedAd(() => claimGuestBonus(REWARDED_MESSAGE_BONUS));

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={8}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.sm,
          }}
        >
          <IconButton accessibilityLabel="Open menu" onPress={() => navigation.openDrawer()}>
            <Menu size={22} color={theme.colors.text} />
          </IconButton>
          <IconButton
            accessibilityLabel="New chat"
            onPress={() => {
              showInterstitialIfReady();
              router.push(`/chat/${generateId()}`);
            }}
          >
            <SquarePen size={20} color={theme.colors.text} />
          </IconButton>
        </View>

        {messages.length === 0 ? (
          <EmptyState icon={Sparkles} title="Say hello" description="Ask anything to start this conversation." />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: theme.spacing.lg }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                onEdit={item.role === 'user' ? (content) => editMessage(item.id, content) : undefined}
                onRegenerate={item.role === 'assistant' ? () => regenerateMessage(item.id) : undefined}
                onDelete={() => deleteMessage(item.id)}
              />
            )}
          />
        )}

        {error ? <ErrorState message={error} onRetry={retryLastError} /> : null}

        {guestLimitReached ? (
          <GuestLimitBanner
            onSignIn={() => router.push('/signin')}
            onWatchAd={rewardedAd.loaded ? rewardedAd.show : undefined}
            watchAdLabel={`+${REWARDED_MESSAGE_BONUS} messages`}
          />
        ) : null}

        <BannerAdView />

        <Composer onSend={sendMessage} onStop={stopGeneration} isStreaming={isStreaming} disabled={guestLimitReached} />
      </KeyboardAvoidingView>
    </Screen>
  );
}
