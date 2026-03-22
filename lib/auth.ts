'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface Creator {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

/** Get the current Supabase session (client-side). Returns null if not logged in. */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Get the current authenticated user. Returns null if not logged in. */
export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** Get the creator profile for the current user. Returns null if not authenticated or no creator row. */
export async function getCreator(): Promise<Creator | null> {
  const user = await getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('creators')
    .select('id, email, name, avatar_url')
    .eq('id', user.id)
    .single();

  if (!data) {
    // Fallback: return basic info from auth user
    return {
      id: user.id,
      email: user.email ?? '',
      name: user.user_metadata?.name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
    };
  }

  return data as Creator;
}

/** Sign in with email and password. */
export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

/** Sign up with email, password, and name. */
export async function signUpWithEmail(email: string, password: string, name: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });
}

/** Sign in with Google OAuth. */
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/create`,
    },
  });
}

/** Sign out the current user. */
export async function signOut() {
  return supabase.auth.signOut();
}

/**
 * React hook for auth state. Subscribes to auth changes and provides
 * the current user, creator profile, loading state, and auth actions.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCreator = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setCreator(null);
      return;
    }
    const c = await getCreator();
    setCreator(c);
  }, []);

  useEffect(() => {
    // Get initial session
    let mounted = true;
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user);
      await loadCreator(data.user);
      if (mounted) setLoading(false);
    }
    init();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        const newUser = session?.user ?? null;
        setUser(newUser);
        await loadCreator(newUser);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadCreator]);

  return { user, creator, loading, signOut };
}
