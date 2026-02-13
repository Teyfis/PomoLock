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
        settings,
        start,
        pause,
        reset,
        skip,
        tick,
        tickHyperfocus,
        enterHyperfocus,
        exitHyperfocus,
    } = useTimerStore()

    // Initialize Web Worker
    useEffect(() => {
        workerRef.current = new Worker('/timerWorker.js')

        workerRef.current.onmessage = (event) => {
            if (event.data.type === 'tick') {
                const currentStatus = useTimerStore.getState().status
                const currentSeconds = useTimerStore.getState().secondsRemaining

                if (currentStatus === 'running') {
                    if (currentSeconds <= 0) {
                        // Timer reached zero — enter hyperfocus if in focus mode
                        const currentMode = useTimerStore.getState().mode
                        if (currentMode === 'focus') {
                            useTimerStore.getState().enterHyperfocus()
                            // Play notification sound
                            playSound()
                        } else {
                            // Break is over — skip to next mode
                            useTimerStore.getState().skip()
                            playSound()
                            // Stop the worker
                            workerRef.current?.postMessage({ type: 'stop' })

                            // Auto-start if enabled
                            const s = useTimerStore.getState().settings
                            if (s.autoStartPomodoros) {
                                setTimeout(() => useTimerStore.getState().start(), 100)
                                workerRef.current?.postMessage({ type: 'start' })
                            }
                        }
                    } else {
                        useTimerStore.getState().tick()
                    }
                } else if (currentStatus === 'hyperfocus') {
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
        // If in hyperfocus, exit it
        if (status === 'hyperfocus') {
            exitHyperfocus()
            return
        }

        // Auto-start the break if enabled
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
    const formatTime = useCallback(
        (totalSeconds: number) => {
            const minutes = Math.floor(Math.abs(totalSeconds) / 60)
            const seconds = Math.abs(totalSeconds) % 60
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        },
        []
    )

    // Get current mode color
    const getModeColor = useCallback(() => {
        if (settings.blackBgOnFocus && mode === 'focus' && (status === 'running' || status === 'hyperfocus')) {
            return '#000000'
        }
        return settings.modeColors[mode]
    }, [settings, mode, status])

    return {
        mode,
        status,
        secondsRemaining,
        hyperfocusSeconds,
        completedPomodoros,
        settings,
        formattedTime: formatTime(secondsRemaining),
        formattedHyperfocus: formatTime(hyperfocusSeconds),
        modeColor: getModeColor(),
        start: handleStart,
        pause: handlePause,
        reset: handleReset,
        skip: handleSkip,
        exitHyperfocus: handleExitHyperfocus,
    }
}

function playSound() {
    const settings = useTimerStore.getState().settings
    if (!settings.soundEnabled) return

    try {
        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(
            settings.soundVolume * 0.3,
            audioContext.currentTime
        )

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)

        // Second beep
        const osc2 = audioContext.createOscillator()
        const gain2 = audioContext.createGain()
        osc2.connect(gain2)
        gain2.connect(audioContext.destination)
        osc2.frequency.setValueAtTime(1000, audioContext.currentTime + 0.6)
        osc2.type = 'sine'
        gain2.gain.setValueAtTime(
            settings.soundVolume * 0.3,
            audioContext.currentTime + 0.6
        )
        osc2.start(audioContext.currentTime + 0.6)
        osc2.stop(audioContext.currentTime + 1.1)
    } catch {
        // Audio not supported
    }
}
