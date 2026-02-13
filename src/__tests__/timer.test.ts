import { describe, it, expect, beforeEach } from 'vitest'
import { useTimerStore } from '@/stores/timerStore'
import { DEFAULT_SETTINGS } from '@/types'

describe('Timer Store', () => {
    beforeEach(() => {
        // Reset store state before each test
        useTimerStore.setState({
            mode: 'focus',
            status: 'idle',
            secondsRemaining: DEFAULT_SETTINGS.focusDuration * 60,
            hyperfocusSeconds: 0,
            completedPomodoros: 0,
            sessionStartedAt: null,
            settings: DEFAULT_SETTINGS,
        })
    })

    describe('initial state', () => {
        it('should start in focus mode', () => {
            const state = useTimerStore.getState()
            expect(state.mode).toBe('focus')
        })

        it('should start with idle status', () => {
            const state = useTimerStore.getState()
            expect(state.status).toBe('idle')
        })

        it('should have correct initial seconds based on focus duration', () => {
            const state = useTimerStore.getState()
            expect(state.secondsRemaining).toBe(
                DEFAULT_SETTINGS.focusDuration * 60
            )
        })

        it('should have zero completed pomodoros', () => {
            const state = useTimerStore.getState()
            expect(state.completedPomodoros).toBe(0)
        })
    })

    describe('start / pause / reset', () => {
        it('should set status to running on start', () => {
            useTimerStore.getState().start()
            expect(useTimerStore.getState().status).toBe('running')
        })

        it('should set sessionStartedAt on first start', () => {
            useTimerStore.getState().start()
            expect(useTimerStore.getState().sessionStartedAt).not.toBeNull()
        })

        it('should preserve sessionStartedAt on resume after pause', () => {
            useTimerStore.getState().start()
            const firstStartedAt = useTimerStore.getState().sessionStartedAt
            useTimerStore.getState().pause()
            useTimerStore.getState().start()
            expect(useTimerStore.getState().sessionStartedAt).toBe(firstStartedAt)
        })

        it('should set status to paused on pause', () => {
            useTimerStore.getState().start()
            useTimerStore.getState().pause()
            expect(useTimerStore.getState().status).toBe('paused')
        })

        it('should reset to initial seconds on reset', () => {
            useTimerStore.getState().start()
            useTimerStore.getState().tick()
            useTimerStore.getState().tick()
            useTimerStore.getState().reset()
            expect(useTimerStore.getState().secondsRemaining).toBe(
                DEFAULT_SETTINGS.focusDuration * 60
            )
            expect(useTimerStore.getState().status).toBe('idle')
        })
    })

    describe('tick', () => {
        it('should decrement seconds by 1 on tick', () => {
            const initialSeconds = useTimerStore.getState().secondsRemaining
            useTimerStore.getState().tick()
            expect(useTimerStore.getState().secondsRemaining).toBe(
                initialSeconds - 1
            )
        })

        it('should not go below 0', () => {
            useTimerStore.setState({ secondsRemaining: 0 })
            useTimerStore.getState().tick()
            expect(useTimerStore.getState().secondsRemaining).toBe(0)
        })
    })

    describe('mode switching', () => {
        it('should switch to short break and set correct seconds', () => {
            useTimerStore.getState().setMode('shortBreak')
            const state = useTimerStore.getState()
            expect(state.mode).toBe('shortBreak')
            expect(state.secondsRemaining).toBe(
                DEFAULT_SETTINGS.shortBreakDuration * 60
            )
        })

        it('should switch to long break and set correct seconds', () => {
            useTimerStore.getState().setMode('longBreak')
            const state = useTimerStore.getState()
            expect(state.mode).toBe('longBreak')
            expect(state.secondsRemaining).toBe(
                DEFAULT_SETTINGS.longBreakDuration * 60
            )
        })

        it('should reset status to idle when switching modes', () => {
            useTimerStore.getState().start()
            useTimerStore.getState().setMode('shortBreak')
            expect(useTimerStore.getState().status).toBe('idle')
        })
    })

    describe('skip', () => {
        it('should go to short break after skipping focus (first pomodoro)', () => {
            useTimerStore.getState().skip()
            expect(useTimerStore.getState().mode).toBe('shortBreak')
            expect(useTimerStore.getState().completedPomodoros).toBe(1)
        })

        it('should go to long break after completing pomodorosUntilLongBreak', () => {
            // Complete 3 pomodoros (short breaks)
            for (let i = 0; i < 3; i++) {
                useTimerStore.getState().skip() // focus -> short break
                useTimerStore.getState().skip() // short break -> focus
            }
            // 4th pomodoro skip should trigger long break
            useTimerStore.getState().skip()
            expect(useTimerStore.getState().mode).toBe('longBreak')
            expect(useTimerStore.getState().completedPomodoros).toBe(4)
        })

        it('should go back to focus after skipping a break', () => {
            useTimerStore.getState().skip() // focus -> short break
            useTimerStore.getState().skip() // short break -> focus
            expect(useTimerStore.getState().mode).toBe('focus')
        })
    })

    describe('hyperfocus', () => {
        it('should enter hyperfocus mode', () => {
            useTimerStore.getState().enterHyperfocus()
            expect(useTimerStore.getState().status).toBe('hyperfocus')
            expect(useTimerStore.getState().hyperfocusSeconds).toBe(0)
        })

        it('should increment hyperfocus seconds on tickHyperfocus', () => {
            useTimerStore.getState().enterHyperfocus()
            useTimerStore.getState().tickHyperfocus()
            useTimerStore.getState().tickHyperfocus()
            expect(useTimerStore.getState().hyperfocusSeconds).toBe(2)
        })

        it('should transition to next mode on exitHyperfocus', () => {
            useTimerStore.getState().enterHyperfocus()
            useTimerStore.getState().tickHyperfocus()
            useTimerStore.getState().exitHyperfocus()
            const state = useTimerStore.getState()
            expect(state.mode).toBe('shortBreak')
            expect(state.status).toBe('idle')
            expect(state.completedPomodoros).toBe(1)
            expect(state.hyperfocusSeconds).toBe(0)
        })
    })

    describe('settings', () => {
        it('should update settings', () => {
            useTimerStore.getState().updateSettings({ focusDuration: 25 })
            expect(useTimerStore.getState().settings.focusDuration).toBe(25)
        })

        it('should update secondsRemaining when idle and duration changes', () => {
            useTimerStore.getState().updateSettings({ focusDuration: 25 })
            expect(useTimerStore.getState().secondsRemaining).toBe(25 * 60)
        })

        it('should NOT update secondsRemaining when running', () => {
            useTimerStore.getState().start()
            const secondsBefore = useTimerStore.getState().secondsRemaining
            useTimerStore.getState().updateSettings({ focusDuration: 25 })
            expect(useTimerStore.getState().secondsRemaining).toBe(secondsBefore)
        })

        it('should update mode colors', () => {
            useTimerStore
                .getState()
                .updateSettings({ modeColors: { focus: '#ff0000', shortBreak: '#00ff00', longBreak: '#0000ff' } })
            expect(useTimerStore.getState().settings.modeColors.focus).toBe(
                '#ff0000'
            )
        })
    })
})
