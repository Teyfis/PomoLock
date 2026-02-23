'use client'

import { useTimerStore } from '@/stores/timerStore'
import type { TimerMode } from '@/types'

const MODES: { value: TimerMode; label: string }[] = [
    { value: 'focus', label: 'Pomodoro' },
    { value: 'shortBreak', label: 'Short Break' },
    { value: 'longBreak', label: 'Long Break' },
]

interface ModeSelectorProps {
    accentColor: string
}

export function ModeSelector({ accentColor }: ModeSelectorProps) {
    const mode = useTimerStore((s) => s.mode)
    const setMode = useTimerStore((s) => s.setMode)
    const reset = useTimerStore((s) => s.reset)

    const handleClick = (value: TimerMode) => {
        // Stop any playing alarm when mode button is clicked
        window.dispatchEvent(new Event('pomodoro-stop-alarm'))

        if (value === mode) {
            // Clicking current tab resets the timer
            reset()
        } else {
            // Switching mode — setMode already resets to that mode's duration
            setMode(value)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="grid grid-cols-3 bg-zinc-800/60 rounded-lg p-1 gap-1">
                {MODES.map((m) => (
                    <button
                        key={m.value}
                        onClick={() => handleClick(m.value)}
                        className="rounded-md text-sm font-semibold py-2 transition-all duration-200 text-zinc-400 hover:text-zinc-200"
                        style={
                            m.value === mode
                                ? { backgroundColor: accentColor, color: 'white' }
                                : undefined
                        }
                    >
                        {m.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
