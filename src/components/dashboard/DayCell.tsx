'use client'

import { cn } from '@/lib/utils'
import { getHeatmapIntensity } from '@/types'

interface DayCellProps {
    day: number | null // null for empty cells
    totalMinutes: number
    isToday?: boolean
}

const INTENSITY_COLORS = [
    'bg-zinc-800/50',      // 0: no data
    'bg-slate-700/80',     // 1: 0-4h
    'bg-slate-600/90',     // 2: 4-7h
    'bg-slate-500',        // 3: 7-10h
    'bg-slate-400',        // 4: 10h+
]

function formatHoursMinutes(totalMinutes: number): string {
    if (totalMinutes === 0) return ''
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `${h}:${String(m).padStart(2, '0')}`
}

export function DayCell({ day, totalMinutes, isToday }: DayCellProps) {
    if (day === null) {
        return <div className="aspect-square" />
    }

    const intensity = getHeatmapIntensity(totalMinutes)
    const timeDisplay = formatHoursMinutes(totalMinutes)

    return (
        <div
            className={cn(
                'aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 transition-colors duration-200 text-center',
                INTENSITY_COLORS[intensity],
                isToday && 'ring-2 ring-white/50'
            )}
        >
            <span
                className={cn(
                    'text-xs font-medium',
                    intensity === 0 ? 'text-zinc-500' : 'text-white/90'
                )}
            >
                {day}
            </span>
            {timeDisplay && (
                <span className="text-[10px] font-mono text-white/70 tabular-nums">
                    {timeDisplay}
                </span>
            )}
        </div>
    )
}
