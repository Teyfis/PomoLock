'use client'

import { useTimerStore } from '@/stores/timerStore'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TimerMode } from '@/types'

const MODES: { value: TimerMode; label: string }[] = [
    { value: 'focus', label: 'Focus' },
    { value: 'shortBreak', label: 'Short Break' },
    { value: 'longBreak', label: 'Long Break' },
]

export function ModeSelector() {
    const mode = useTimerStore((s) => s.mode)
    const setMode = useTimerStore((s) => s.setMode)
    const status = useTimerStore((s) => s.status)

    return (
        <Tabs
            value={mode}
            onValueChange={(v) => {
                if (status === 'idle') {
                    setMode(v as TimerMode)
                }
            }}
            className="w-full max-w-md mx-auto"
        >
            <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm">
                {MODES.map((m) => (
                    <TabsTrigger
                        key={m.value}
                        value={m.value}
                        disabled={status !== 'idle'}
                        className="text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20 data-[state=active]:shadow-none transition-all duration-200 disabled:opacity-50"
                    >
                        {m.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}
