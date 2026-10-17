import AsyncStorage from '@react-native-async-storage/async-storage';

import type { User } from '@/types';

const USERS_KEY = 'omnichat_users';
const SESSION_KEY = 'omnichat_session';

/**
 * Local-only account store — there's no backend, so "sign up" just registers
 * a profile on this device and "sign in" checks against it. Good enough for
 * a personal single-device profile; not meant as a real multi-device auth
 * system, so passwords are kept as plain strings rather than reaching for a
 * hashing library that would add real-security theater without a server to
 * actually protect credentials in transit.
 */
interface StoredUser extends User {
  password: string;
}

export class AuthError extends Error {}

async function readUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublicUser({ password: _password, ...user }: StoredUser): User {
  return user;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  avatarUri: string | null;
}

export async function signUp({ name, email, password, avatarUri }: SignUpInput): Promise<User> {
  const normalizedEmail = normalizeEmail(email);
  const users = await readUsers();
  if (users.some((user) => user.email === normalizedEmail)) {
    throw new AuthError('An account with this email already exists.');
  }

  const stored: StoredUser = { name: name.trim(), email: normalizedEmail, password, avatarUri };
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, stored]));

  const user = toPublicUser(stored);
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export interface SignInInput {
  email: string;
  password: string;
}

export async function signIn({ email, password }: SignInInput): Promise<User> {
  const normalizedEmail = normalizeEmail(email);
  const users = await readUsers();
  const match = users.find((user) => user.email === normalizedEmail);
  if (!match || match.password !== password) {
    throw new AuthError('Incorrect email or password.');
  }

  const user = toPublicUser(match);
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function signOut(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function getSession(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}
