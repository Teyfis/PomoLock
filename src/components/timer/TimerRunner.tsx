'use client'

import { useEffect, useRef } from 'react'
import { useTimerStore } from '@/stores/timerStore'

// Request notification permission on first load
function requestNotificationPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
    }
}

function showTimerNotification(mode: string) {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return

    const title = mode === 'focus' ? '⏰ Pomodoro finished!' : '☕ Break is over!'
    const body = mode === 'focus' ? 'Time for a break!' : 'Time to focus!'

    try {
        const notification = new Notification(title, {
            body,
            icon: '/icon-192.png',
            tag: 'pomolock-timer', // Replaces previous notification
            requireInteraction: true, // Stays until user clicks
        })

        notification.onclick = () => {
            window.focus()
            notification.close()
        }
    } catch (_) {
        // Fallback: some browsers don't support Notification constructor in this context
    }
}

export function TimerRunner() {
    const status = useTimerStore((s) => s.status)
    const mode = useTimerStore((s) => s.mode)
    const secondsRemaining = useTimerStore((s) => s.secondsRemaining)
    const hyperfocusSeconds = useTimerStore((s) => s.hyperfocusSeconds)
    const tick = useTimerStore((s) => s.tick)
    const tickHyperfocus = useTimerStore((s) => s.tickHyperfocus)

    // Settings
    const showTimerInTitle = useTimerStore((s) => s.settings.showTimerInTitle ?? true)

    const workerRef = useRef<Worker | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const alarmCancelledRef = useRef(false)

    // Request notification permission on mount
    useEffect(() => {
        requestNotificationPermission()
    }, [])

    // Initialize worker
    useEffect(() => {
        if (typeof Worker !== 'undefined') {
            workerRef.current = new Worker('/timerWorker.js')
            workerRef.current.onmessage = (e) => {
                if (e.data.type === 'tick') {
                    const state = useTimerStore.getState()
                    if (state.status === 'hyperfocus') {
                        state.tickHyperfocus()
                    } else if (state.status === 'running') {
                        state.tick()
                    }
                } else if (e.data.type === 'completed') {
                    // Worker detected timer completion — handle alarm + notification
                    const state = useTimerStore.getState()
                    if (state.status !== 'running') return // Already handled

                    const { settings, mode, hyperfocusEnabled, reset, enterHyperfocus } = state

                    // Show notification (works in background tabs!)
                    if (!document.hasFocus()) {
                        showTimerNotification(mode)
                    }

                    // Play alarm sound
                    const shouldPlaySound = settings.soundEnabled && !(mode === 'focus' && hyperfocusEnabled)
                    if (shouldPlaySound) {
                        playAlarm(settings)
                    }

                    // Handle mode transition
                    if (mode === 'focus' && hyperfocusEnabled) {
                        enterHyperfocus()
                        workerRef.current?.postMessage({ type: 'hyperfocus' })
                    } else {
                        if (mode === 'focus') {
                            const { completedPomodoros, lastPomodoroDate } = state
                            const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
                            const dailyCount = lastPomodoroDate !== today ? 0 : completedPomodoros
                            useTimerStore.setState({ completedPomodoros: dailyCount + 1, lastPomodoroDate: today })
                        }
                        reset()
                    }
                }
            }
        }

        return () => {
            workerRef.current?.terminate()
        }
    }, [])

    // Helper to play alarm sound
    const playAlarm = (settings: { alarmSound: string; soundVolume: number; alarmRepeatCount: number }) => {
        try {
            const repeat = settings.alarmRepeatCount || 3
            const soundFile = settings.alarmSound === 'kazakhstan' ? '/kazakhstan.mp3' : '/bip.mp3'
            alarmCancelledRef.current = false

            const playOnce = (index: number) => {
                if (index >= repeat || alarmCancelledRef.current) return
                const audio = new Audio(soundFile)
                audio.volume = settings.soundVolume
                audioRef.current = audio
                audio.play().catch(() => { /* AbortError is expected when interrupted */ })
                audio.onended = () => {
                    audioRef.current = null
                    playOnce(index + 1)
                }
            }
            playOnce(0)
        } catch (e) {
            console.error("Audio playback failed", e)
        }
    }

    // Helper to stop alarm
    const stopAlarm = () => {
        if (audioRef.current) {
            try {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            } catch (_) { /* ignore */ }
            audioRef.current = null
        }
        alarmCancelledRef.current = true
    }

    // Listen for explicit "stop alarm" from UI components (e.g. ModeSelector)
    useEffect(() => {
        const handler = () => stopAlarm()
        window.addEventListener('pomodoro-stop-alarm', handler)
        return () => window.removeEventListener('pomodoro-stop-alarm', handler)
    }, [])

    // Start/Stop worker + stop alarm ONLY when user starts a new timer
    useEffect(() => {
        if (status === 'running') {
            stopAlarm()
            workerRef.current?.postMessage({ type: 'start', seconds: secondsRemaining })
        } else if (status === 'hyperfocus') {
            stopAlarm()
            workerRef.current?.postMessage({ type: 'start', seconds: 0 })
            workerRef.current?.postMessage({ type: 'hyperfocus' })
        } else {
            workerRef.current?.postMessage({ type: 'stop' })
        }
    }, [status])

    // Fallback: Alarm & Completion Logic for when tab IS in foreground
    // (the worker 'completed' handler above covers background tabs)
    useEffect(() => {
        if (status === 'running' && secondsRemaining === 0) {
            // Check if worker already handled this (it might have via 'completed' message)
            // The worker sets secondsRemaining via tick(), so if we get here,
            // it means the React effect fired. The worker's 'completed' handler
            // also runs, but it checks status === 'running' which would be false
            // after reset(). So this is safe as a double-check.
            const state = useTimerStore.getState()
            if (state.status !== 'running') return // Already handled by worker

            const { settings, mode, hyperfocusEnabled, reset, enterHyperfocus } = state

            const shouldPlaySound = settings.soundEnabled && !(mode === 'focus' && hyperfocusEnabled)
            if (shouldPlaySound) {
                playAlarm(settings)
            }

            if (mode === 'focus' && hyperfocusEnabled) {
                enterHyperfocus()
                workerRef.current?.postMessage({ type: 'hyperfocus' })
            } else {
                if (mode === 'focus') {
                    const { completedPomodoros, lastPomodoroDate } = state
                    const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
                    const dailyCount = lastPomodoroDate !== today ? 0 : completedPomodoros
                    useTimerStore.setState({ completedPomodoros: dailyCount + 1, lastPomodoroDate: today })
                }
                reset()
            }
        }
    }, [secondsRemaining, status])

    // Update Page Title
    useEffect(() => {
        if (!showTimerInTitle) {
            document.title = 'PomoLock'
            return
        }

        const format = (s: number) => {
            const m = Math.floor(s / 60)
            const sec = s % 60
            return `${m}:${sec.toString().padStart(2, '0')}`
        }

        let title = 'PomoLock'
        if (status === 'running' || status === 'paused') {
            title = `(${format(secondsRemaining)}) ${mode === 'focus' ? 'PomoLock' : 'Break'}`
        } else if (status === 'hyperfocus') {
            title = `(Hyper: ${format(hyperfocusSeconds)}) PomoLock`
        }

        document.title = title
    }, [secondsRemaining, hyperfocusSeconds, status, mode, showTimerInTitle])

    return null
}
