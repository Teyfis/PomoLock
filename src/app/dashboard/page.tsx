'use client'

import { useMemo } from 'react'
import { HeatmapCalendar } from '@/components/dashboard/HeatmapCalendar'
import { ArrowLeft } from 'lucide-react'
import { useTimerStore } from '@/stores/timerStore'
import Link from 'next/link'
import type { DayStats, FocusSession } from '@/types'

function buildStatsFromSessions(sessions: FocusSession[]): DayStats[] {
    const dayMap = new Map<string, DayStats>()

    for (const session of sessions) {
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
    const cloudSessions = useTimerStore((s) => s.cloudSessions)

    // Merge cloud sessions + local pending sessions (deduplicate by id)
    const allSessions = useMemo(() => {
        const sessionMap = new Map<string, FocusSession>()

        for (const session of cloudSessions) {
            sessionMap.set(session.id, session)
        }

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

                <div className="bg-zinc-800/30 rounded-xl p-5 border border-zinc-700/30 transform scale-110 origin-top">
                    <HeatmapCalendar sessions={sessions} accentColor={dashboardAccent} />
                </div>
            </div>
        </div>
    )
}
