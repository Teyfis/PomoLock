'use client'

import { useTimer } from '@/hooks/useTimer'
import { ModeSelector } from './ModeSelector'
import { TimerDisplay } from './TimerDisplay'
import { TimerControls } from './TimerControls'

export function Timer() {
    const {
        mode,
        status,
        completedPomodoros,
        formattedTime,
        formattedHyperfocus,
        modeColor,
        start,
        pause,
        reset,
        skip,
        exitHyperfocus,
    } = useTimer()

    const isHyperfocus = status === 'hyperfocus'

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center transition-colors duration-700 ease-in-out"
            style={{ backgroundColor: modeColor }}
        >
            <div className="w-full max-w-lg mx-auto px-4 flex flex-col items-center gap-10">
                {/* Mode tabs */}
                <ModeSelector />

                {/* Timer display */}
                <TimerDisplay
                    formattedTime={formattedTime}
                    isHyperfocus={isHyperfocus}
                    formattedHyperfocus={formattedHyperfocus}
                />

                {/* Controls */}
                <TimerControls
                    status={status}
                    isHyperfocus={isHyperfocus}
                    onStart={start}
                    onPause={pause}
                    onReset={reset}
                    onSkip={skip}
                    onExitHyperfocus={exitHyperfocus}
                />

                {/* Pomodoro counter */}
                <div className="text-white/60 text-sm font-medium tracking-wide">
                    #{completedPomodoros} pomodoros completed
                </div>
            </div>
        </div>
    )
}
