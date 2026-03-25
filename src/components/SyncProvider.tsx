'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@/hooks/useUser'
import { useTimerStore } from '@/stores/timerStore'
import { syncOnLogin, pushSettingsToCloud, pushPendingSessions, fetchCloudSessions } from '@/lib/syncController'

/**
 * SyncProvider - handles bidirectional sync between localStorage and Supabase.
 * 
 * On login: pulls cloud settings, pushes pending sessions, and prefetches cloud sessions.
 * On session complete: pushes new sessions to cloud immediately (debounced).
 * On settings change: pushes settings to cloud (debounced).
 */
export function SyncProvider() {
    const { user } = useUser()
    const hasSyncedRef = useRef(false)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)
    const sessionDebounceRef = useRef<NodeJS.Timeout | null>(null)
    const prevSettingsRef = useRef<string>('')
    const prevPendingCountRef = useRef<number>(0)

    // Sync on login
    useEffect(() => {
        if (!user || hasSyncedRef.current) return
        hasSyncedRef.current = true

        const { settings, pendingSessions, replaceSettings, removeSyncedSessions, setCloudSessions } = useTimerStore.getState()
        prevPendingCountRef.current = pendingSessions.length

        syncOnLogin(
            settings,
            pendingSessions,
            (mergedSettings) => {
                replaceSettings(mergedSettings)
            },
            (syncedIds) => {
                removeSyncedSessions(syncedIds)
            },
        ).then(() => {
            // After sync, prefetch all cloud sessions for the dashboard
            return fetchCloudSessions()
        }).then((sessions) => {
            setCloudSessions(sessions)
            // Update count after initial sync
            prevPendingCountRef.current = useTimerStore.getState().pendingSessions.length
        }).catch(console.error)
    }, [user])

    // Reset sync flag on logout
    useEffect(() => {
        if (!user) {
            hasSyncedRef.current = false
        }
    }, [user])

    // Push new sessions to cloud in real-time (debounced)
    useEffect(() => {
        if (!user) return

        const unsub = useTimerStore.subscribe((state) => {
            const currentCount = state.pendingSessions.length

            // Only trigger when new sessions are added (count increased)
            if (currentCount > prevPendingCountRef.current) {
                prevPendingCountRef.current = currentCount

                // Debounce to batch rapid session additions
                if (sessionDebounceRef.current) clearTimeout(sessionDebounceRef.current)
                sessionDebounceRef.current = setTimeout(async () => {
                    try {
                        const { pendingSessions, removeSyncedSessions, cloudSessions, setCloudSessions } = useTimerStore.getState()
                        if (pendingSessions.length === 0) return

                        const syncedIds = await pushPendingSessions(pendingSessions)
                        if (syncedIds.length > 0) {
                            // Get the sessions that were just synced to add to cloudSessions
                            const syncedSessions = pendingSessions.filter(s => syncedIds.includes(s.id))
                            removeSyncedSessions(syncedIds)
                            // Update cloudSessions so dashboard reflects them immediately
                            setCloudSessions([...cloudSessions, ...syncedSessions])
                            prevPendingCountRef.current = useTimerStore.getState().pendingSessions.length
                        }
                    } catch (err) {
                        console.error('Failed to push sessions to cloud:', err)
                    }
                }, 1000) // Wait 1 second to batch
            } else {
                // Count decreased (sessions were removed after sync), update ref
                prevPendingCountRef.current = currentCount
            }
        })

        return () => {
            unsub()
            if (sessionDebounceRef.current) clearTimeout(sessionDebounceRef.current)
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
