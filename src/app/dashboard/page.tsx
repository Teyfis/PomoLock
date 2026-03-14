'use client'

import { useState, useEffect, useMemo } from 'react'
import { HeatmapCalendar } from '@/components/dashboard/HeatmapCalendar'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useTimerStore } from '@/stores/timerStore'
import { useUser } from '@/hooks/useUser'
import { fetchCloudSessions } from '@/lib/syncController'
import Link from 'next/link'
import type { DayStats, FocusSession } from '@/types'

function buildStatsFromSessions(sessions: FocusSession[]): DayStats[] {
    const dayMap = new Map<string, DayStats>()

    for (const session of sessions) {
        // Use local date instead of UTC to avoid timezone issues
        const localDate = new Date(session.startedAt)
        const date = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`
        const existing = dayMap.get(date) || { date, totalMinutes: 0, sessionCount: 0 }
        existing.totalMinutes += Math.floor(session.actualDurationSeconds / 60)
        existing.sessionCount += 1
        dayMap.set(date, existing)
    }

    return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export default function DashboardPage() {
    const dashboardAccent = useTimerStore((s) => s.settings.dashboardAccent) || '#8b5cf6'
    const pendingSessions = useTimerStore((s) => s.pendingSessions)
    const { user } = useUser()

    const [cloudSessions, setCloudSessions] = useState<FocusSession[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch cloud sessions when user is logged in
    useEffect(() => {
        if (user) {
            setLoading(true)
            fetchCloudSessions()
                .then((sessions) => setCloudSessions(sessions))
                .catch(console.error)
                .finally(() => setLoading(false))
        } else {
            setCloudSessions([])
            setLoading(false)
        }
    }, [user])

    // Merge cloud sessions + local pending sessions (deduplicate by id)
    const allSessions = useMemo(() => {
        const sessionMap = new Map<string, FocusSession>()

        // Cloud sessions first (already synced)
        for (const session of cloudSessions) {
            sessionMap.set(session.id, session)
        }

        // Add local pending sessions (not yet synced)
        for (const session of pendingSessions) {
            if (!sessionMap.has(session.id)) {
                sessionMap.set(session.id, session)
            }
        }

        return Array.from(sessionMap.values())
    }, [cloudSessions, pendingSessions])

    const sessions = buildStatsFromSessions(allSessions)

    return (
        <div className="min-h-screen bg-[#1A1B24] pt-16 px-4 pb-8">
            <div className="max-w-lg mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-2xl font-bold text-white">Statistics</h1>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Loader2 className="h-6 w-6 text-zinc-500 animate-spin mb-2" />
                        <p className="text-zinc-500 text-sm">Loading statistics...</p>
                    </div>
                ) : sessions.length > 0 ? (
                    <div className="bg-zinc-800/30 rounded-xl p-5 border border-zinc-700/30 transform scale-110 origin-top">
                        <HeatmapCalendar sessions={sessions} accentColor={dashboardAccent} />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-zinc-500 text-sm">No sessions recorded yet.</p>
                        <p className="text-zinc-600 text-xs mt-1">Complete a Pomodoro to see your statistics here!</p>
                    </div>
                )}

                {!user && !loading && sessions.length > 0 && (
                    <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 text-center">
                        <p className="text-yellow-300/90 text-sm font-medium">⚠️ You are not logged in</p>
                        <p className="text-yellow-400/60 text-xs mt-1">
                            These statistics are saved locally on this device only. Log in to sync your hours across devices.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
