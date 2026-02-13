'use client'

import { useTimerStore } from '@/stores/timerStore'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    const status = useTimerStore((s) => s.status)

    const handleModeChange = (value: string) => {
        const newMode = value as TimerMode
        if (newMode === mode) {
            // Clicking current tab resets the timer
            reset()
        } else {
            setMode(newMode)
        }
    }

    return (
        <Tabs value={mode} onValueChange={handleModeChange} className="w-full max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-800/60 h-11 rounded-full p-1">
                {MODES.map((m) => (
                    <TabsTrigger
                        key={m.value}
                        value={m.value}
                        className="rounded-full text-sm font-semibold text-zinc-400 data-[state=active]:text-white data-[state=active]:shadow-none transition-all duration-200"
                        style={
                            m.value === mode
                                ? { backgroundColor: accentColor, color: 'white' }
                                : undefined
                        }
                    >
                        {m.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}
