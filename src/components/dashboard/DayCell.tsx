'use client'

import { cn } from '@/lib/utils'
import { getHeatmapIntensity } from '@/types'

interface DayCellProps {
    day: number | null // null for empty cells
    totalMinutes: number
    isToday?: boolean
    intensityColors: string[]
}

function formatHoursMinutes(totalMinutes: number): string {
    if (totalMinutes === 0) return ''
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `${h}:${String(m).padStart(2, '0')}`
}

export function DayCell({ day, totalMinutes, isToday, intensityColors }: DayCellProps) {
    if (day === null) {
        return <div className="aspect-square" />
    }

    const intensity = getHeatmapIntensity(totalMinutes)
    const timeDisplay = formatHoursMinutes(totalMinutes)
    const bgColor = intensity === 0 ? 'rgba(255,255,255,0.04)' : intensityColors[intensity]

    return (
        <div
            className={cn(
                'aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 transition-colors duration-200 text-center',
                isToday && 'ring-2 ring-white/50'
            )}
            style={{ backgroundColor: bgColor }}
        >
            <span
                className={cn(
                    'text-xs font-medium tabular-nums',
                    intensity === 0 ? 'text-zinc-500' : 'text-white/90'
                )}
                style={{ fontFamily: 'var(--font-rubik)' }}
            >
                {day}
            </span>
            {timeDisplay && (
                <span
                    className="text-[10px] font-mono text-white/70 tabular-nums"
                    style={{ fontFamily: 'var(--font-rubik)' }}
                >
                    {timeDisplay}
                </span>
            )}
        </div>
    )
}
