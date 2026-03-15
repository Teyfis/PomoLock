'use client'

import { useTimer } from '@/hooks/useTimer'
import { ModeSelector } from './ModeSelector'
import { TimerDisplay } from './TimerDisplay'
import { TimerControls } from './TimerControls'
import { BarChart3, Hourglass } from 'lucide-react'
import Link from 'next/link'

export function Timer() {
    const {
        mode,
        status,
        completedPomodoros,
        hyperfocusEnabled,
        formattedTime,
        accentColor,
        modeLabel,
        progress,
        start,
        pause,
        reset,
        skip,
        toggleHyperfocus,
    } = useTimer()

    const pomodoroText = completedPomodoros === 1 ? 'Pomodoro' : 'Pomodoros'

    return (
        <div className="min-h-screen bg-[#1C1C1E] flex flex-col items-center pt-8 px-4">
            {/* Header */}
            <header className="w-full max-w-md flex items-center justify-between mb-8">
                <h1
                    className="text-2xl font-bold text-white italic tracking-tight"
                    style={{ color: accentColor }}
                >
                    PomoLock
                </h1>
            </header>

            {/* Mode selector */}
            <div className="w-full max-w-md mb-6">
                <ModeSelector accentColor={accentColor} />
            </div>

            {/* Pomodoro counter + Stats */}
            <div className="w-full max-w-md flex items-center justify-between mb-10 px-1">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Hourglass className="h-4 w-4" style={{ color: accentColor }} />
                    <span className="font-medium tabular-nums">
                        {completedPomodoros} {pomodoroText}
                    </span>
                </div>
                <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-zinc-400 text-sm hover:text-zinc-300 transition-colors"
                >
                    <BarChart3 className="h-4 w-4" />
                    Stats
                </Link>
            </div>

            {/* Circular timer */}
            <div className="mb-10">
                <TimerDisplay
                    formattedTime={formattedTime}
                    modeLabel={modeLabel}
                    progress={progress}
                    accentColor={accentColor}
                    isRunning={status === 'running' || status === 'hyperfocus'}
                    isHyperfocus={status === 'hyperfocus'}
                    onReset={reset}
                />
            </div>

            {/* Controls */}
            <TimerControls
                status={status}
                hyperfocusEnabled={hyperfocusEnabled}
                accentColor={accentColor}
                onStart={start}
                onPause={pause}
                onSkip={skip}
                onToggleHyperfocus={toggleHyperfocus}
            />
        </div>
    )
}
