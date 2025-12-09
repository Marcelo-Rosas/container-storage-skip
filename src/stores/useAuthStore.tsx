import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface User {
  id: string
  email: string
  full_name?: string
  role?: 'admin' | 'operator'
  client_id?: string | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('sb_token'),
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Verify token and get basic user data
          const authData = await api.auth.getUser(token)
          const userId = authData.id

          // Fetch Profile for role and name
          const profiles = await api.db.select<any>(
            'profiles',
            `id=eq.${userId}`,
            token,
          )
          const profile = profiles[0] || {}

          // Fetch Client User for client_id if applicable
          const clientUsers = await api.db.select<any>(
            'client_users',
            `user_id=eq.${userId}`,
            token,
          )
          const clientUser = clientUsers[0]

          setUser({
            id: userId,
            email: authData.email,
            full_name: profile.full_name || authData.email,
            role: profile.role || 'operator', // Default to operator if not defined
            client_id: clientUser?.client_id || null,
          })
        } catch (error) {
          console.error('Session expired', error)
          logout()
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [token])

  const login = async (email: string, pass: string) => {
    setIsLoading(true)
    try {
      const data = await api.auth.signIn(email, pass)
      localStorage.setItem('sb_token', data.access_token)
      setToken(data.access_token)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('sb_token')
    setToken(null)
    setUser(null)
  }

  return React.createElement(
    AuthContext.Provider,
    { value: { user, token, isLoading, login, logout } },
    children,
  )
}

const useAuthStore = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthStore must be used within AuthProvider')
  return context
}

export default useAuthStore
