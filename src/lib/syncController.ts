import { createClient } from '@/lib/supabase/client'
import type { AppSettings, FocusSession } from '@/types'

// ==========================================
// Sync Controller
// Handles bidirectional sync between localStorage and Supabase
// ==========================================

/**
 * Fetch user settings from Supabase and return them.
 * Returns null if no settings exist in the cloud.
 */
export async function fetchCloudSettings(): Promise<AppSettings | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user.id)
        .single()

    if (error || !data) return null
    return data.settings as AppSettings
}

/**
 * Save user settings to Supabase (upsert).
 */
export async function pushSettingsToCloud(settings: AppSettings): Promise<boolean> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
        .from('user_settings')
        .upsert({
            user_id: user.id,
            settings,
            updated_at: new Date().toISOString(),
        })

    return !error
}

/**
 * Push a single focus session to Supabase.
 * Returns true if successful.
 */
export async function pushSessionToCloud(session: FocusSession): Promise<boolean> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
        .from('focus_sessions')
        .upsert({
            id: session.id,
            user_id: user.id,
            started_at: session.startedAt,
            duration_minutes: session.durationMinutes,
            actual_duration_seconds: session.actualDurationSeconds,
            hyperfocus_seconds: session.hyperfocusSeconds,
            completed: session.completed,
            created_at: session.createdAt,
        })

    return !error
}

/**
 * Push all pending sessions to Supabase.
 * Returns the IDs of sessions that were successfully synced.
 */
export async function pushPendingSessions(sessions: FocusSession[]): Promise<string[]> {
    const syncedIds: string[] = []

    for (const session of sessions) {
        const success = await pushSessionToCloud(session)
        if (success) {
            syncedIds.push(session.id)
        }
    }

    return syncedIds
}

/**
 * Full sync on login: pull cloud settings and push pending sessions.
 * Cloud settings take priority over local (last-write-wins from cloud).
 */
export async function syncOnLogin(
    localSettings: AppSettings,
    pendingSessions: FocusSession[],
    onSettingsMerged: (settings: AppSettings) => void,
    onSessionsSynced: (syncedIds: string[]) => void,
): Promise<void> {
    // 1. Fetch cloud settings
    const cloudSettings = await fetchCloudSettings()

    if (cloudSettings) {
        // Cloud wins — but deep merge to preserve new local fields
        const merged: AppSettings = {
            ...localSettings,
            ...cloudSettings,
            modeColors: {
                ...localSettings.modeColors,
                ...(cloudSettings.modeColors ?? {}),
            },
        }
        onSettingsMerged(merged)
    } else {
        // No cloud settings yet — push local settings to cloud
        await pushSettingsToCloud(localSettings)
    }

    // 2. Push pending sessions
    if (pendingSessions.length > 0) {
        const syncedIds = await pushPendingSessions(pendingSessions)
        if (syncedIds.length > 0) {
            onSessionsSynced(syncedIds)
        }
    }
}

/**
 * Check if the user is online.
 */
export function isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
}

/**
 * Listen for online/offline events and call the callback when coming back online.
 */
export function onReconnect(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => { }

    const handler = () => {
        if (navigator.onLine) {
            callback()
        }
    }

    window.addEventListener('online', handler)
    return () => window.removeEventListener('online', handler)
}
