import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isSigniningIn: boolean
  signInError: Error | null
  isSigningUp: boolean
  signUpError: Error | null
  isRequestingPasswordReset: boolean
  signInWithPassword: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  initialize: () => Promise<void>
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  isSigniningIn: false,
  signInError: null,
  isSigningUp: false,
  signUpError: null,
  isRequestingPasswordReset: false,

  signInWithPassword: async (email, password) => {
    set({ isSigniningIn: true, signInError: null })
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      set({ isSigniningIn: false, signInError: error })
    } else {
      set({
        isSigniningIn: false,
        user: data.user,
        session: data.session,
      })
    }
  },

  signInWithGoogle: async () => {
    set({ isSigniningIn: true, signInError: null })
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    if (error) {
      set({ isSigniningIn: false, signInError: error })
    }
    // If success, Supabase redirects, so we don't necessarily need to set loading false here
    // but for consistency in case redirect is delayed or handled differently:
    // set({ isSigniningIn: false });
  },

  signUp: async (email, password) => {
    set({ isSigningUp: true, signUpError: null })
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
    if (error) {
      set({ isSigningUp: false, signUpError: error })
    } else {
      set({
        isSigningUp: false,
        user: data.user,
        session: data.session,
      })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },

  requestPasswordReset: async (email) => {
    set({ isRequestingPasswordReset: true })
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    set({ isRequestingPasswordReset: false })
  },

  updatePassword: async (password) => {
    await supabase.auth.updateUser({ password })
  },

  initialize: async () => {
    set({ isLoading: true })
    const {
      data: { session },
    } = await supabase.auth.getSession()
    set({
      user: session?.user ?? null,
      session,
      isLoading: false,
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? null,
        session,
        isLoading: false,
      })
    })
  },
}))

export default useAuthStore
