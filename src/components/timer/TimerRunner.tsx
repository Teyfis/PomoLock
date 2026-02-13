'use client'

import { useEffect, useRef } from 'react'
import { useTimerStore } from '@/stores/timerStore'

export function TimerRunner() {
    const status = useTimerStore((s) => s.status)
    const mode = useTimerStore((s) => s.mode)
    const secondsRemaining = useTimerStore((s) => s.secondsRemaining)
    const tick = useTimerStore((s) => s.tick)
    const tickHyperfocus = useTimerStore((s) => s.tickHyperfocus)

    // Settings
    const showTimerInTitle = useTimerStore((s) => s.settings.showTimerInTitle ?? true)

    const workerRef = useRef<Worker | null>(null)

    // Initialize worker
    useEffect(() => {
        if (typeof Worker !== 'undefined') {
            workerRef.current = new Worker('/timerWorker.js')
            workerRef.current.onmessage = (e) => {
                if (e.data.type === 'tick') {
                    const currentStatus = useTimerStore.getState().status
                    if (currentStatus === 'hyperfocus') {
                        tickHyperfocus()
                    } else if (currentStatus === 'running') {
                        tick()
                    }
                }
            }
        }

        return () => {
            workerRef.current?.terminate()
        }
    }, [tick, tickHyperfocus])

    // Start/Stop worker
    useEffect(() => {
        if (status === 'running' || status === 'hyperfocus') {
            workerRef.current?.postMessage({ type: 'start' })
        } else {
            workerRef.current?.postMessage({ type: 'stop' })
        }
    }, [status])

    // Update Page Title
    useEffect(() => {
        if (!showTimerInTitle) {
            document.title = 'Pomodoro Timer'
            return
        }

        const format = (s: number) => {
            const m = Math.floor(s / 60)
            const sec = s % 60
            return `${m}:${sec.toString().padStart(2, '0')}`
        }

        let title = 'Pomodoro Timer'
        if (status === 'running' || status === 'paused') {
            title = `(${format(secondsRemaining)}) ${mode === 'focus' ? 'Pomodoro' : 'Break'}`
        } else if (status === 'hyperfocus') {
            // For hyperfocus we count UP, so secondsRemaining is actually 0 or close to 0 in store logic?
            // No, hyperfocusSeconds is tracked separately.
            const hyperfocusSeconds = useTimerStore.getState().hyperfocusSeconds
            title = `(Hyper: ${format(hyperfocusSeconds)}) Pomodoro`
        }

        document.title = title
    }, [secondsRemaining, status, mode, showTimerInTitle])

    return null
}
