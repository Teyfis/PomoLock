'use client'

import { cn } from '@/lib/utils'

interface DayCellProps {
    day: number | null
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

function getIntensity(totalMinutes: number): number {
    const hours = totalMinutes / 60
    if (hours >= 12) return 4
    if (hours >= 7) return 3
    if (hours >= 4) return 2
    if (hours > 0) return 1
    return 0
}

export function DayCell({ day, totalMinutes, isToday, intensityColors }: DayCellProps) {
    if (day === null) {
        return <div className="h-[60px]" />
    }

    const intensity = getIntensity(totalMinutes)
    const timeDisplay = formatHoursMinutes(totalMinutes)
    const bgColor = intensity === 0 ? 'rgba(255,255,255,0.04)' : intensityColors[intensity]

    return (
        <div
            className={cn(
                'h-[60px] flex flex-col items-center justify-center gap-0.5 transition-colors duration-200',
                isToday && 'ring-[1.5px] ring-white/60'
            )}
            style={{ backgroundColor: intensity === 0 ? 'transparent' : bgColor }}
        >
            <span
                className={cn(
                    'text-[15px] font-medium tabular-nums leading-tight',
                    intensity === 0 ? 'text-zinc-500' : 'text-white/85'
                )}
            >
                {day}
            </span>
            {timeDisplay && (
                <span className="text-[17px] text-white/70 tabular-nums leading-tight font-semibold">
                    {timeDisplay}
                </span>
            )}
        </div>
    )
}
