'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@/hooks/useUser'
import { useTimerStore } from '@/stores/timerStore'
import { syncOnLogin, pushSettingsToCloud } from '@/lib/syncController'
import type { AppSettings } from '@/types'

/**
 * SyncProvider - handles bidirectional sync between localStorage and Supabase.
 * 
 * On login: pulls cloud settings and pushes pending sessions.
 * On settings change: pushes settings to cloud (debounced).
 */
export function SyncProvider() {
    const { user } = useUser()
    const hasSyncedRef = useRef(false)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)
    const prevSettingsRef = useRef<string>('')

    // Sync on login
    useEffect(() => {
        if (!user || hasSyncedRef.current) return
        hasSyncedRef.current = true

        const { settings, pendingSessions, replaceSettings, removeSyncedSessions } = useTimerStore.getState()

        syncOnLogin(
            settings,
            pendingSessions,
            (mergedSettings) => {
                replaceSettings(mergedSettings)
            },
            (syncedIds) => {
                removeSyncedSessions(syncedIds)
            },
        ).catch(console.error)
    }, [user])

    // Reset sync flag on logout
    useEffect(() => {
        if (!user) {
            hasSyncedRef.current = false
        }
    }, [user])

    // Push settings to cloud on change (debounced)
    // Uses a polling approach to detect settings changes
    useEffect(() => {
        if (!user) return

        // Store initial settings hash
        prevSettingsRef.current = JSON.stringify(useTimerStore.getState().settings)

        const unsub = useTimerStore.subscribe((state) => {
            const currentHash = JSON.stringify(state.settings)
            if (currentHash !== prevSettingsRef.current) {
                prevSettingsRef.current = currentHash

                // Debounce to avoid pushing on every keystroke
                if (debounceRef.current) clearTimeout(debounceRef.current)
                debounceRef.current = setTimeout(() => {
                    pushSettingsToCloud(state.settings).catch(console.error)
                }, 2000) // Wait 2 seconds after last change
            }
        })

        return () => {
            unsub()
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [user])

    return null
}
