export interface User {
  name: string;
  email: string;
  avatarUri: string | null;
}

export interface AuthState {
  user: User | null;
  /** Whether the stored session has been read yet — avoids a sign-in flash on app boot. */
  isHydrated: boolean;
}
