'use client'

import { HeatmapCalendar } from '@/components/dashboard/HeatmapCalendar'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { DayStats } from '@/types'

// TODO: Replace with real data from Supabase once auth is set up
const MOCK_SESSIONS: DayStats[] = [
    { date: '2026-02-01', totalMinutes: 240, sessionCount: 5 },
    { date: '2026-02-02', totalMinutes: 180, sessionCount: 4 },
    { date: '2026-02-03', totalMinutes: 360, sessionCount: 7 },
    { date: '2026-02-04', totalMinutes: 120, sessionCount: 3 },
    { date: '2026-02-05', totalMinutes: 480, sessionCount: 9 },
    { date: '2026-02-06', totalMinutes: 0, sessionCount: 0 },
    { date: '2026-02-07', totalMinutes: 90, sessionCount: 2 },
    { date: '2026-02-08', totalMinutes: 300, sessionCount: 6 },
    { date: '2026-02-09', totalMinutes: 420, sessionCount: 8 },
    { date: '2026-02-10', totalMinutes: 600, sessionCount: 12 },
    { date: '2026-02-11', totalMinutes: 150, sessionCount: 3 },
    { date: '2026-02-12', totalMinutes: 210, sessionCount: 4 },
]

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#1a1a2e] pt-8 px-4 pb-8">
            <div className="max-w-lg mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Statistics</h1>
                </div>
                <div className="bg-zinc-800/30 rounded-xl p-5 border border-zinc-700/30">
                    <HeatmapCalendar sessions={MOCK_SESSIONS} />
                </div>
            </div>
        </div>
    )
}
