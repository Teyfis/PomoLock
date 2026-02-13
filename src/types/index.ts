// ==========================================
// Timer Types
// ==========================================

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'hyperfocus'

export interface TimerSettings {
    focusDuration: number // minutes
    shortBreakDuration: number // minutes
    longBreakDuration: number // minutes
    pomodorosUntilLongBreak: number
    autoStartBreaks: boolean
    autoStartPomodoros: boolean
    soundEnabled: boolean
    soundVolume: number // 0-1
}

export interface ModeColors {
    focus: string
    shortBreak: string
    longBreak: string
    hyperfocus: string
}

export interface AppSettings extends TimerSettings {
    modeColors: ModeColors
    locale: 'en' | 'pt-BR'
}

export const DEFAULT_SETTINGS: AppSettings = {
    focusDuration: 50,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    soundVolume: 0.5,
    modeColors: {
        focus: '#e74c6f',
        shortBreak: '#38858a',
        longBreak: '#397097',
        hyperfocus: '#8b5cf6',
    },
    locale: 'en',
}

// ==========================================
// Focus Session Types
// ==========================================

export interface FocusSession {
    id: string
    userId: string
    startedAt: string // ISO timestamp
    durationMinutes: number // configured duration
    actualDurationSeconds: number // real duration including hyperfocus
    hyperfocusSeconds: number // extra time beyond timer
    completed: boolean
    createdAt: string // ISO timestamp
}

// ==========================================
// Heatmap Types
// ==========================================

export interface DayStats {
    date: string // YYYY-MM-DD
    totalMinutes: number
    sessionCount: number
}

export type HeatmapIntensity = 0 | 1 | 2 | 3 | 4

export function getHeatmapIntensity(totalMinutes: number): HeatmapIntensity {
    const hours = totalMinutes / 60
    if (hours === 0) return 0
    if (hours < 4) return 1
    if (hours < 7) return 2
    if (hours < 10) return 3
    return 4
}

// ==========================================
// User / Auth Types
// ==========================================

export interface UserProfile {
    id: string
    settings: AppSettings
}
