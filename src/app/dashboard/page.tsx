'use client'

import { HeatmapCalendar } from '@/components/dashboard/HeatmapCalendar'
import { ArrowLeft } from 'lucide-react'
import { useTimerStore } from '@/stores/timerStore'
import Link from 'next/link'
import type { DayStats } from '@/types'

function buildStatsFromSessions(): DayStats[] {
    // Build stats from pendingSessions stored in localStorage
    const { pendingSessions, completedPomodoros } = useTimerStore.getState()

    const dayMap = new Map<string, DayStats>()

    // Add data from pending sessions
    for (const session of pendingSessions) {
        const date = session.startedAt.split('T')[0]
        const existing = dayMap.get(date) || { date, totalMinutes: 0, sessionCount: 0 }
        existing.totalMinutes += session.durationMinutes
        existing.sessionCount += 1
        dayMap.set(date, existing)
    }

    // If there are completed pomodoros today but no pending sessions, show today
    if (completedPomodoros > 0 && dayMap.size === 0) {
        const today = new Date().toISOString().split('T')[0]
        dayMap.set(today, {
            date: today,
            totalMinutes: completedPomodoros * (useTimerStore.getState().settings.focusDuration),
            sessionCount: completedPomodoros,
        })
    }

    return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export default function DashboardPage() {
    const dashboardAccent = useTimerStore((s) => s.settings.dashboardAccent) || '#8b5cf6'
    const pendingSessions = useTimerStore((s) => s.pendingSessions)
    const completedPomodoros = useTimerStore((s) => s.completedPomodoros)

    // Rebuild stats reactively when sessions or pomodoros change
    const sessions = buildStatsFromSessions()

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

                {sessions.length > 0 ? (
                    <div className="bg-zinc-800/30 rounded-xl p-5 border border-zinc-700/30 transform scale-110 origin-top">
                        <HeatmapCalendar sessions={sessions} accentColor={dashboardAccent} />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-zinc-500 text-sm">No sessions recorded yet.</p>
                        <p className="text-zinc-600 text-xs mt-1">Complete a Pomodoro to see your statistics here!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
