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

    // Start/Stop worker
    useEffect(() => {
        if (status === 'running' || status === 'hyperfocus') {
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
            // User request: "Quando o modo hyperfocus estiver ativado quero que o alarme nao toque."
            const shouldPlaySound = settings.soundEnabled && !(mode === 'focus' && hyperfocusEnabled)

            if (shouldPlaySound) {
                try {
                    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
                    if (AudioContext) {
                        const ctx = new AudioContext()
                        const now = ctx.currentTime
                        const repeat = settings.alarmRepeatCount || 3

                        // Schedule "Ringbell" sounds (Bell-like additive synthesis)
                        for (let i = 0; i < repeat; i++) {
                            const startTime = now + (i * 2.0) // 2s interval for bell decay

                            // Fundamental frequency (C5 ~ 523Hz)
                            const osc1 = ctx.createOscillator()
                            const gain1 = ctx.createGain()
                            osc1.connect(gain1)
                            gain1.connect(ctx.destination)
                            osc1.type = 'sine'
                            osc1.frequency.setValueAtTime(523.25, startTime)

                            // Harmonic 1 (Octave ~ 1046Hz) - brighter attack
                            const osc2 = ctx.createOscillator()
                            const gain2 = ctx.createGain()
                            osc2.connect(gain2)
                            gain2.connect(ctx.destination)
                            osc2.type = 'sine'
                            osc2.frequency.setValueAtTime(1046.50, startTime)

                            // Harmonic 2 (Twelfth ~ 1569Hz) - metallic ring
                            const osc3 = ctx.createOscillator()
                            const gain3 = ctx.createGain()
                            osc3.connect(gain3)
                            gain3.connect(ctx.destination)
                            osc3.type = 'sine'
                            osc3.frequency.setValueAtTime(1569, startTime)

                            // Envelope - Quick attack, long exponential decay
                            const volume = settings.soundVolume

                            // Fundamental: Long decay
                            gain1.gain.setValueAtTime(0.01, startTime)
                            gain1.gain.exponentialRampToValueAtTime(volume, startTime + 0.05)
                            gain1.gain.exponentialRampToValueAtTime(0.01, startTime + 2.0)

                            // Harmonic 1: shorter decay
                            gain2.gain.setValueAtTime(0.01, startTime)
                            gain2.gain.exponentialRampToValueAtTime(volume * 0.6, startTime + 0.05)
                            gain2.gain.exponentialRampToValueAtTime(0.01, startTime + 1.5)

                            // Harmonic 2: shortest decay (ping)
                            gain3.gain.setValueAtTime(0.01, startTime)
                            gain3.gain.exponentialRampToValueAtTime(volume * 0.3, startTime + 0.05)
                            gain3.gain.exponentialRampToValueAtTime(0.01, startTime + 1.0)

                            osc1.start(startTime)
                            osc1.stop(startTime + 2.0)
                            osc2.start(startTime)
                            osc2.stop(startTime + 2.0)
                            osc3.start(startTime)
                            osc3.stop(startTime + 2.0)
                        }
                    }
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
