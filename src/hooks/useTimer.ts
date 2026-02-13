'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useTimerStore } from '@/stores/timerStore'

export function useTimer() {
    const workerRef = useRef<Worker | null>(null)

    const {
        mode,
        status,
        secondsRemaining,
        hyperfocusSeconds,
        completedPomodoros,
        hyperfocusEnabled,
        settings,
        start,
        pause,
        reset,
        skip,
        tick,
        tickHyperfocus,
        enterHyperfocus,
        exitHyperfocus,
        toggleHyperfocus,
        setMode,
    } = useTimerStore()

    // Initialize Web Worker
    useEffect(() => {
        workerRef.current = new Worker('/timerWorker.js')

        workerRef.current.onmessage = (event) => {
            if (event.data.type === 'tick') {
                const state = useTimerStore.getState()

                if (state.status === 'running') {
                    if (state.secondsRemaining <= 0) {
                        const isHyperfocusOn = state.hyperfocusEnabled

                        if (state.mode === 'focus' && isHyperfocusOn) {
                            // Silently enter hyperfocus — NO alarm
                            useTimerStore.getState().enterHyperfocus()
                        } else {
                            // Normal completion: play sound and skip
                            playAlarm(state.settings.soundVolume)
                            useTimerStore.getState().skip()
                            workerRef.current?.postMessage({ type: 'stop' })

                            // Auto-start if enabled
                            const s = useTimerStore.getState().settings
                            const nextMode = useTimerStore.getState().mode
                            if (
                                (nextMode !== 'focus' && s.autoStartBreaks) ||
                                (nextMode === 'focus' && s.autoStartPomodoros)
                            ) {
                                setTimeout(() => {
                                    useTimerStore.getState().start()
                                    workerRef.current?.postMessage({ type: 'start' })
                                }, 100)
                            }
                        }
                    } else {
                        useTimerStore.getState().tick()
                    }
                } else if (state.status === 'hyperfocus') {
                    useTimerStore.getState().tickHyperfocus()
                }
            }
        }

        return () => {
            workerRef.current?.terminate()
        }
    }, [])

    // Start/stop worker based on status
    useEffect(() => {
        if (status === 'running' || status === 'hyperfocus') {
            workerRef.current?.postMessage({ type: 'start' })
        } else {
            workerRef.current?.postMessage({ type: 'stop' })
        }
    }, [status])

    const handleStart = useCallback(() => {
        start()
    }, [start])

    const handlePause = useCallback(() => {
        pause()
    }, [pause])

    const handleReset = useCallback(() => {
        reset()
    }, [reset])

    const handleSkip = useCallback(() => {
        if (status === 'hyperfocus') {
            exitHyperfocus()
            return
        }
        skip()
        const s = useTimerStore.getState().settings
        const nextMode = useTimerStore.getState().mode
        if (
            (nextMode !== 'focus' && s.autoStartBreaks) ||
            (nextMode === 'focus' && s.autoStartPomodoros)
        ) {
            setTimeout(() => {
                useTimerStore.getState().start()
            }, 100)
        }
    }, [skip, status, exitHyperfocus])

    const handleExitHyperfocus = useCallback(() => {
        exitHyperfocus()
    }, [exitHyperfocus])

    // Format time display
    const formatTime = useCallback((totalSeconds: number) => {
        const minutes = Math.floor(Math.abs(totalSeconds) / 60)
        const seconds = Math.abs(totalSeconds) % 60
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }, [])

    // Display time: in hyperfocus mode, show the counting-up time
    const displaySeconds = status === 'hyperfocus' ? hyperfocusSeconds : secondsRemaining

    // Get current accent color
    const getAccentColor = useCallback(() => {
        if (status === 'hyperfocus') return settings.modeColors.hyperfocus
        return settings.modeColors[mode]
    }, [settings, mode, status])

    // Get mode label
    const getModeLabel = useCallback(() => {
        if (status === 'hyperfocus') return 'Hyperfocus'
        switch (mode) {
            case 'focus': return 'Focus'
            case 'shortBreak': return 'Short Break'
            case 'longBreak': return 'Long Break'
        }
    }, [mode, status])

    // Progress ratio for circular ring (1 = full, 0 = empty)
    const getProgress = useCallback(() => {
        if (status === 'hyperfocus') return 1 // Full ring during hyperfocus
        const total = (() => {
            switch (mode) {
                case 'focus': return settings.focusDuration * 60
                case 'shortBreak': return settings.shortBreakDuration * 60
                case 'longBreak': return settings.longBreakDuration * 60
            }
        })()
        if (total === 0) return 0
        return secondsRemaining / total
    }, [mode, status, secondsRemaining, settings])

    return {
        mode,
        status,
        secondsRemaining,
        hyperfocusSeconds,
        completedPomodoros,
        hyperfocusEnabled,
        settings,
        formattedTime: formatTime(displaySeconds),
        accentColor: getAccentColor(),
        modeLabel: getModeLabel(),
        progress: getProgress(),
        start: handleStart,
        pause: handlePause,
        reset: handleReset,
        skip: handleSkip,
        exitHyperfocus: handleExitHyperfocus,
        toggleHyperfocus,
        setMode,
    }
}

// Minimalist alarm sound — short bell-like tones
function playAlarm(volume: number) {
    const settings = useTimerStore.getState().settings
    if (!settings.soundEnabled) return

    try {
        const ctx = new AudioContext()
        const v = volume * 0.25

        // Bell tone 1
        const playTone = (freq: number, startTime: number, duration: number) => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.frequency.setValueAtTime(freq, startTime)
            osc.type = 'sine'
            gain.gain.setValueAtTime(v, startTime)
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
            osc.start(startTime)
            osc.stop(startTime + duration)
        }

        const now = ctx.currentTime
        playTone(880, now, 0.15)         // A5
        playTone(880, now + 0.2, 0.15)   // A5
        playTone(1174, now + 0.5, 0.25)  // D6
    } catch {
        // Audio not supported
    }
}
