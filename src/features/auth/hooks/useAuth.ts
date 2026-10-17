import { useCallback, useEffect, useState } from 'react';

import { authActions, useAppDispatch, useAppState } from '@/context';
import { AuthError, getSession, signIn, signOut, signUp, type SignInInput, type SignUpInput } from '@/services/storage/authStorage';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isHydrated } = useAppState().auth;
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      dispatch(authActions.setUser(session));
      dispatch(authActions.setHydrated());
    })();
  }, [dispatch]);

  const handleSignUp = useCallback(
    async (input: SignUpInput) => {
      setError(null);
      setIsSubmitting(true);
      try {
        const newUser = await signUp(input);
        dispatch(authActions.setUser(newUser));
        return true;
      } catch (err) {
        setError(err instanceof AuthError ? err.message : 'Could not create your account.');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch]
  );

  const handleSignIn = useCallback(
    async (input: SignInInput) => {
      setError(null);
      setIsSubmitting(true);
      try {
        const existingUser = await signIn(input);
        dispatch(authActions.setUser(existingUser));
        return true;
      } catch (err) {
        setError(err instanceof AuthError ? err.message : 'Could not sign in.');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch]
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    dispatch(authActions.setUser(null));
  }, [dispatch]);

  const clearError = useCallback(() => setError(null), []);

  return {
    user,
    isHydrated,
    isAuthenticated: user != null,
    error,
    isSubmitting,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    clearError,
  };
}
