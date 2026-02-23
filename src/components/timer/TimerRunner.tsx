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

    // Start/Stop worker + stop alarm on any status change
    useEffect(() => {
        // Stop any playing alarm whenever status changes (start, reset, mode switch, etc.)
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
            audioRef.current = null
        }
        alarmCancelledRef.current = true

        if (status === 'running' || status === 'hyperfocus') {
            workerRef.current?.postMessage({ type: 'start' })
        } else {
            workerRef.current?.postMessage({ type: 'stop' })
        }
    }, [status, mode])

    // Alarm & Completion Logic
    useEffect(() => {
        if (status === 'running' && secondsRemaining === 0) {
            const { settings, mode, hyperfocusEnabled, reset, enterHyperfocus } = useTimerStore.getState()

            // Only play sound if NOT entering Hyperfocus automatically
            // User request: "Quando o modo hyperfocus estiver ativado quero que o alarme nao toque."
            const shouldPlaySound = settings.soundEnabled && !(mode === 'focus' && hyperfocusEnabled)

            if (shouldPlaySound) {
                try {
                    const repeat = settings.alarmRepeatCount || 3
                    const soundFile = settings.alarmSound === 'kazakhstan' ? '/kazakhstan.mp3' : '/bip.mp3'

                    // Reset cancel flag for this alarm sequence
                    alarmCancelledRef.current = false

                    // Play the selected alarm sound file, repeated N times
                    const playOnce = (index: number) => {
                        if (index >= repeat || alarmCancelledRef.current) return
                        const audio = new Audio(soundFile)
                        audio.volume = settings.soundVolume
                        audioRef.current = audio
                        audio.play().catch(err => console.error('Audio playback failed', err))
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
                // User requested: "Voltar para o tempo que o usuario setou" (Reset)
                if (mode === 'focus') {
                    useTimerStore.setState(s => ({ completedPomodoros: s.completedPomodoros + 1 }))
                }
                reset()
            }
        }
    }, [secondsRemaining, status])

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
