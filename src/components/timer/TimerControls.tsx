'use client'

import { Play, Pause, SkipForward, Brain } from 'lucide-react'
import type { TimerStatus } from '@/types'

interface TimerControlsProps {
    status: TimerStatus
    hyperfocusEnabled: boolean
    accentColor: string
    onStart: () => void
    onPause: () => void
    onSkip: () => void
    onToggleHyperfocus: () => void
}

export function TimerControls({
    status,
    hyperfocusEnabled,
    accentColor,
    onStart,
    onPause,
    onSkip,
    onToggleHyperfocus,
}: TimerControlsProps) {
    const isActive = status === 'running' || status === 'hyperfocus'

    return (
        <div className="flex items-center justify-center gap-5">
            {/* Hyperfocus toggle */}
            <button
                onClick={onToggleHyperfocus}
                className="h-14 w-14 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                    backgroundColor: hyperfocusEnabled ? `${accentColor}20` : 'rgba(255,255,255,0.06)',
                    color: hyperfocusEnabled ? accentColor : 'rgba(255,255,255,0.4)',
                    border: hyperfocusEnabled ? `2px solid ${accentColor}40` : '2px solid transparent',
                }}
                aria-label={hyperfocusEnabled ? 'Disable hyperfocus' : 'Enable hyperfocus'}
                title={hyperfocusEnabled ? 'Hyperfocus ON' : 'Hyperfocus OFF'}
            >
                <Brain className="h-5 w-5" />
            </button>

            {/* Play / Pause button */}
            <button
                onClick={isActive ? onPause : onStart}
                className="h-16 w-16 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg"
                style={{ backgroundColor: accentColor }}
                aria-label={isActive ? 'Pause' : 'Start'}
            >
                {isActive ? (
                    <Pause className="h-6 w-6 text-white fill-white" />
                ) : (
                    <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                )}
            </button>

            {/* Skip button */}
            <button
                onClick={onSkip}
                disabled={status === 'idle'}
                className="h-14 w-14 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.4)',
                }}
                aria-label="Skip"
            >
                <SkipForward className="h-5 w-5" />
            </button>
        </div>
    )
}
