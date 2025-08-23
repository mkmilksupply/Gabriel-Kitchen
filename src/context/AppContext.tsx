import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getStaffMembers } from '../lib/dataClient'

const MODE = (import.meta.env.VITE_API_MODE ?? 'api') as 'api' | 'supabase'

type AppContextShape = {
  staff: any[]
  refreshStaff: () => Promise<void>
}

const AppContext = createContext<AppContextShape | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staff, setStaff] = useState<any[]>([])

  const refreshStaff = useCallback(async () => {
    const rows = await getStaffMembers()
    setStaff(rows as any[])
  }, [])

  // Realtime (Supabase mode only)
  useEffect(() => {
    let unsub: (() => void) | undefined

    async function setupRealtimeSubscriptions() {
      if (MODE !== 'supabase') return
      const { subscribeToTable } = await import('../lib/supabaseClient')

      const s1 = subscribeToTable('users', refreshStaff)
      unsub = () => s1.unsubscribe()
    }

    setupRealtimeSubscriptions()
    return () => unsub?.()
  }, [refreshStaff])

  // Initial load
  useEffect(() => {
    void refreshStaff()
  }, [refreshStaff])

  const value = useMemo<AppContextShape>(() => ({ staff, refreshStaff }), [staff, refreshStaff])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within <AppProvider>')
  return ctx
}
