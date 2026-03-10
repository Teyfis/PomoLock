'use client'

import { useEffect, useRef } from 'react'
import { useTimerStore } from '@/stores/timerStore'

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
                }
            }
        }

        return () => {
            workerRef.current?.terminate()
        }
    }, [])

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
        if (status === 'running' || status === 'hyperfocus') {
            stopAlarm()
            workerRef.current?.postMessage({ type: 'start' })
        } else {
            workerRef.current?.postMessage({ type: 'stop' })
        }
    }, [status])

    // Alarm & Completion Logic
    useEffect(() => {
        if (status === 'running' && secondsRemaining === 0) {
            const { settings, mode, hyperfocusEnabled, reset, enterHyperfocus } = useTimerStore.getState()

            // Only play sound if NOT entering Hyperfocus automatically
            const shouldPlaySound = settings.soundEnabled && !(mode === 'focus' && hyperfocusEnabled)

            if (shouldPlaySound) {
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

            if (mode === 'focus' && hyperfocusEnabled) {
                enterHyperfocus()
            } else {
                if (mode === 'focus') {
                    const { completedPomodoros, lastPomodoroDate } = useTimerStore.getState()
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
