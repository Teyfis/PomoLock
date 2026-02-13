'use client'

import { cn } from '@/lib/utils'

interface TimerDisplayProps {
    formattedTime: string
    isHyperfocus: boolean
    formattedHyperfocus: string
}

export function TimerDisplay({
    formattedTime,
    isHyperfocus,
    formattedHyperfocus,
}: TimerDisplayProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-2">
            {/* Main timer display */}
            <div
                className={cn(
                    'text-8xl sm:text-9xl font-bold tracking-tight text-white font-mono tabular-nums select-none transition-all duration-500',
                    isHyperfocus && 'text-7xl sm:text-8xl'
                )}
            >
                {formattedTime}
            </div>

            {/* Hyperfocus indicator */}
            {isHyperfocus && (
                <div className="flex flex-col items-center gap-1 animate-pulse">
                    <span className="text-xs uppercase tracking-widest text-white/60 font-medium">
                        Hyperfocus
                    </span>
                    <span className="text-3xl sm:text-4xl font-mono text-white/90 tabular-nums">
                        +{formattedHyperfocus}
                    </span>
                </div>
            )}
        </div>
    )
}
