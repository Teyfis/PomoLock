'use client'

import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, SkipForward, Square } from 'lucide-react'
import type { TimerStatus } from '@/types'

interface TimerControlsProps {
    status: TimerStatus
    isHyperfocus: boolean
    onStart: () => void
    onPause: () => void
    onReset: () => void
    onSkip: () => void
    onExitHyperfocus: () => void
}

export function TimerControls({
    status,
    isHyperfocus,
    onStart,
    onPause,
    onReset,
    onSkip,
    onExitHyperfocus,
}: TimerControlsProps) {
    return (
        <div className="flex items-center justify-center gap-3">
            {/* Reset button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onReset}
                disabled={status === 'idle'}
                className="text-white/70 hover:text-white hover:bg-white/10 h-12 w-12 rounded-full transition-all duration-200 disabled:opacity-30"
                aria-label="Reset"
            >
                <RotateCcw className="h-5 w-5" />
            </Button>

            {/* Main action button */}
            {isHyperfocus ? (
                <Button
                    onClick={onExitHyperfocus}
                    className="h-16 w-40 rounded-full text-lg font-bold bg-white text-black hover:bg-white/90 shadow-lg shadow-black/20 transition-all duration-200 active:scale-95"
                    aria-label="Stop hyperfocus"
                >
                    <Square className="h-5 w-5 mr-2 fill-current" />
                    Stop
                </Button>
            ) : status === 'running' ? (
                <Button
                    onClick={onPause}
                    className="h-16 w-40 rounded-full text-lg font-bold bg-white text-black hover:bg-white/90 shadow-lg shadow-black/20 transition-all duration-200 active:scale-95"
                    aria-label="Pause"
                >
                    <Pause className="h-5 w-5 mr-2 fill-current" />
                    Pause
                </Button>
            ) : (
                <Button
                    onClick={onStart}
                    className="h-16 w-40 rounded-full text-lg font-bold bg-white text-black hover:bg-white/90 shadow-lg shadow-black/20 transition-all duration-200 active:scale-95"
                    aria-label="Start"
                >
                    <Play className="h-5 w-5 mr-2 fill-current" />
                    Start
                </Button>
            )}

            {/* Skip button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onSkip}
                disabled={status === 'idle'}
                className="text-white/70 hover:text-white hover:bg-white/10 h-12 w-12 rounded-full transition-all duration-200 disabled:opacity-30"
                aria-label="Skip"
            >
                <SkipForward className="h-5 w-5" />
            </Button>
        </div>
    )
}
