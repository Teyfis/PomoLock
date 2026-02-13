import { useCallback } from 'react'
import { useTimerStore } from '@/stores/timerStore'

export function useTimer() {
    const {
        mode,
        status,
        secondsRemaining,
        hyperfocusSeconds,
        completedPomodoros,
        hyperfocusEnabled,
        settings,
        start,
        pause: storePause,
        reset,
        skip,
        toggleHyperfocus,
        setMode,
    } = useTimerStore()

    const handlePause = useCallback(() => {
        storePause()
    }, [storePause])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const isHyperfocusPaused = useCallback(() => {
        return status === 'paused' && mode === 'focus' && secondsRemaining === 0 && hyperfocusEnabled
    }, [status, mode, secondsRemaining, hyperfocusEnabled])

    const displaySeconds = status === 'hyperfocus' || isHyperfocusPaused() ? hyperfocusSeconds : secondsRemaining

    const getAccentColor = useCallback(() => {
        if (status === 'hyperfocus' || isHyperfocusPaused()) return settings.modeColors.hyperfocus
        return settings.modeColors[mode]
    }, [settings, mode, status, isHyperfocusPaused])

    const getModeLabel = useCallback(() => {
        if (status === 'hyperfocus') return 'Hyperfocus'
        if (isHyperfocusPaused()) return 'Hyperfocus Paused'

        switch (mode) {
            case 'focus': return 'Pomodoro'
            case 'shortBreak': return 'Short Break'
            case 'longBreak': return 'Long Break'
        }
    }, [mode, status, isHyperfocusPaused])

    const getProgress = useCallback(() => {
        if (status === 'hyperfocus' || isHyperfocusPaused()) return 1
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
        start,
        pause: handlePause,
        reset,
        skip,
        toggleHyperfocus,
        setMode,
    }
}
