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
    resetStats: () => void
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
                    pausedFromHyperfocus: false,
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
                    pausedFromHyperfocus: false,
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
                    pausedFromHyperfocus: false,
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
                    pausedFromHyperfocus: false,
                })
            },

            toggleHyperfocus: () => {
                const { hyperfocusEnabled } = get()
                set({ hyperfocusEnabled: !hyperfocusEnabled })
            },

            updateSettings: (newSettings) => {
                const { settings, mode, status, secondsRemaining } = get()
                const merged = { ...settings, ...newSettings }
                const updates: Partial<TimerState> = { settings: merged }

                // If timer is idle, update the remaining seconds to match new durations
                if (status === 'idle') {
                    updates.secondsRemaining = getDurationForMode(mode, merged)
                }
                // If paused, try to preserve ELAPSED time
                // New Remaining = New Total - (Old Total - Old Remaining)
                else if (status === 'paused') {
                    const oldTotal = getDurationForMode(mode, settings)
                    const elapsed = oldTotal - secondsRemaining
                    const newTotal = getDurationForMode(mode, merged)
                    const newRemaining = Math.max(0, newTotal - elapsed)

                    updates.secondsRemaining = newRemaining
                }

                set(updates)
            },

            setSecondsRemaining: (seconds) => {
                set({ secondsRemaining: seconds })
            },

            resetStats: () => {
                set({ completedPomodoros: 0 })
            },
        }),
        {
            name: 'pomodoro-timer-storage',
            // Persist timer state so navigation doesn't reset the timer
            partialize: (state) => ({
                settings: state.settings,
                completedPomodoros: state.completedPomodoros,
                hyperfocusEnabled: state.hyperfocusEnabled,
                mode: state.mode,
                status: state.status,
                secondsRemaining: state.secondsRemaining,
                hyperfocusSeconds: state.hyperfocusSeconds,
                pausedFromHyperfocus: state.pausedFromHyperfocus,
            }),
            // Deep merge to handle new settings fields (e.g. dashboardAccent)
            merge: (persisted, current) => {
                const p = persisted as Partial<TimerState> | undefined
                if (!p) return current
                const merged = { ...current, ...p }
                // Deep merge settings so new defaults aren't lost
                if (p.settings) {
                    merged.settings = {
                        ...current.settings,
                        ...p.settings,
                        modeColors: {
                            ...current.settings.modeColors,
                            ...(p.settings.modeColors ?? {}),
                        },
                    }
                }
                return merged
            },
        }
    )
)
