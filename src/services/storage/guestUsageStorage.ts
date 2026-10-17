import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_MESSAGE_COUNT_KEY = 'omnichat_guest_message_count';

/** Free messages a signed-out guest can send before being asked to sign in. */
export const GUEST_MESSAGE_LIMIT = 5;

export async function getGuestMessageCount(): Promise<number> {
  const raw = await AsyncStorage.getItem(GUEST_MESSAGE_COUNT_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function incrementGuestMessageCount(): Promise<number> {
  const next = (await getGuestMessageCount()) + 1;
  await AsyncStorage.setItem(GUEST_MESSAGE_COUNT_KEY, String(next));
  return next;
}

/** Rewinds the guest's message count by `amount` (floored at 0) after a rewarded-ad watch. */
export async function grantGuestMessageBonus(amount: number): Promise<number> {
  const next = Math.max(0, (await getGuestMessageCount()) - amount);
  await AsyncStorage.setItem(GUEST_MESSAGE_COUNT_KEY, String(next));
  return next;
}
