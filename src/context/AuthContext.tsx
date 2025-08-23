import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { login, loginWithUsername } from '../lib/dataClient'

type User = {
  id: number | string
  email?: string
  username?: string
  name?: string
  role?: string
}

type AuthContextShape = {
  user: User | null
  loading: boolean
  error: string | null
  loginWithEmail: (email: string, password: string) => Promise<void>
  loginWithUser: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextShape | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const u = await login(email, password)
      setUser(u as User)
    } catch (e: any) {
      setError(e?.message || 'Login failed')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const loginWithUser = useCallback(async (username: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const u = await loginWithUsername(username, password)
      setUser(u as User)
    } catch (e: any) {
      setError(e?.message || 'Login failed')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setError(null)
  }, [])

  const value = useMemo<AuthContextShape>(
    () => ({ user, loading, error, loginWithEmail, loginWithUser, logout }),
    [user, loading, error, loginWithEmail, loginWithUser, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
