import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
    type TimerMode,
    type TimerStatus,
    type AppSettings,
    DEFAULT_SETTINGS,
} from '@/types'

// ==========================================
// Timer Store Types
// ==========================================

interface TimerState {
    // Timer state
    mode: TimerMode
    status: TimerStatus
    secondsRemaining: number
    hyperfocusSeconds: number
    completedPomodoros: number
    sessionStartedAt: string | null
    hyperfocusEnabled: boolean
    pausedFromHyperfocus: boolean

    // Settings
    settings: AppSettings

    // Actions
    setMode: (mode: TimerMode) => void
    start: () => void
    pause: () => void
    reset: () => void
    skip: () => void
    tick: () => void
    tickHyperfocus: () => void
    enterHyperfocus: () => void
    exitHyperfocus: () => void
    toggleHyperfocus: () => void
    updateSettings: (settings: Partial<AppSettings>) => void
    setSecondsRemaining: (seconds: number) => void
}

// ==========================================
// Helper Functions
// ==========================================

export function getDurationForMode(mode: TimerMode, settings: AppSettings): number {
    switch (mode) {
        case 'focus':
            return settings.focusDuration * 60
        case 'shortBreak':
            return settings.shortBreakDuration * 60
        case 'longBreak':
            return settings.longBreakDuration * 60
    }
}

export function getNextMode(
    currentMode: TimerMode,
    completedPomodoros: number,
    settings: AppSettings
): TimerMode {
    if (currentMode === 'focus') {
        const nextPomodoros = completedPomodoros + 1
        if (nextPomodoros % settings.pomodorosUntilLongBreak === 0) {
            return 'longBreak'
        }
        return 'shortBreak'
    }
    return 'focus'
}

// ==========================================
// Timer Store
// ==========================================

export const useTimerStore = create<TimerState>()(
    persist(
        (set, get) => ({
            // Initial state
            mode: 'focus',
            status: 'idle',
            secondsRemaining: DEFAULT_SETTINGS.focusDuration * 60,
            hyperfocusSeconds: 0,
            completedPomodoros: 0,
            sessionStartedAt: null,
            hyperfocusEnabled: false,
            pausedFromHyperfocus: false,

            // Settings
            settings: DEFAULT_SETTINGS,

            // Actions
            setMode: (mode) => {
                const { settings } = get()
                set({
                    mode,
                    status: 'idle',
                    secondsRemaining: getDurationForMode(mode, settings),
                    hyperfocusSeconds: 0,
                    sessionStartedAt: null,
                })
            },

            start: () => {
                const { status, sessionStartedAt, pausedFromHyperfocus } = get()
                if (pausedFromHyperfocus) {
                    // Resume hyperfocus counting
                    set({ status: 'hyperfocus', pausedFromHyperfocus: false })
                } else {
                    set({
                        status: 'running',
                        sessionStartedAt:
                            status === 'idle'
                                ? new Date().toISOString()
                                : sessionStartedAt,
                    })
                }
            },

            pause: () => {
                const { status } = get()
                set({
                    status: 'paused',
                    pausedFromHyperfocus: status === 'hyperfocus',
                })
            },

            reset: () => {
                const { mode, settings } = get()
                set({
                    status: 'idle',
                    secondsRemaining: getDurationForMode(mode, settings),
                    hyperfocusSeconds: 0,
                    sessionStartedAt: null,
                })
            },

            skip: () => {
                const { mode, completedPomodoros, settings } = get()
                const nextMode = getNextMode(mode, completedPomodoros, settings)
                const newPomodoros =
                    mode === 'focus' ? completedPomodoros + 1 : completedPomodoros

                set({
                    mode: nextMode,
                    status: 'idle',
                    secondsRemaining: getDurationForMode(nextMode, settings),
                    hyperfocusSeconds: 0,
                    completedPomodoros: newPomodoros,
                    sessionStartedAt: null,
                })
            },

            tick: () => {
                const { secondsRemaining } = get()
                if (secondsRemaining > 0) {
                    set({ secondsRemaining: secondsRemaining - 1 })
                }
            },

            tickHyperfocus: () => {
                const { hyperfocusSeconds } = get()
                set({ hyperfocusSeconds: hyperfocusSeconds + 1 })
            },

            enterHyperfocus: () => {
                set({ status: 'hyperfocus', hyperfocusSeconds: 0 })
            },

            exitHyperfocus: () => {
                const { mode, completedPomodoros, settings } = get()
                const nextMode = getNextMode(mode, completedPomodoros, settings)
                const newPomodoros = completedPomodoros + 1

                set({
                    mode: nextMode,
                    status: 'idle',
                    secondsRemaining: getDurationForMode(nextMode, settings),
                    hyperfocusSeconds: 0,
                    completedPomodoros: newPomodoros,
                    sessionStartedAt: null,
                })
            },

            toggleHyperfocus: () => {
                const { hyperfocusEnabled } = get()
                set({ hyperfocusEnabled: !hyperfocusEnabled })
            },

            updateSettings: (newSettings) => {
                const { settings, mode, status } = get()
                const merged = { ...settings, ...newSettings }
                const updates: Partial<TimerState> = { settings: merged }

                // If timer is idle, update the remaining seconds to match new durations
                if (status === 'idle') {
                    updates.secondsRemaining = getDurationForMode(mode, merged)
                }

                set(updates)
            },

            setSecondsRemaining: (seconds) => {
                set({ secondsRemaining: seconds })
            },
        }),
        {
            name: 'pomodoro-timer-storage',
            partialize: (state) => ({
                settings: state.settings,
                completedPomodoros: state.completedPomodoros,
                hyperfocusEnabled: state.hyperfocusEnabled,
            }),
        }
    )
)
