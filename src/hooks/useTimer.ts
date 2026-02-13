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
        if (status === 'hyperfocus') {
            // Pausing in hyperfocus -> Switch to Short Break directly
            setMode('shortBreak')
        } else {
            storePause()
        }
    }, [status, setMode, storePause])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const displaySeconds = status === 'hyperfocus' ? hyperfocusSeconds : secondsRemaining

    const getAccentColor = useCallback(() => {
        if (status === 'hyperfocus') return settings.modeColors.hyperfocus
        return settings.modeColors[mode]
    }, [settings, mode, status])

    const getModeLabel = useCallback(() => {
        if (status === 'hyperfocus') return 'Hyperfocus'
        switch (mode) {
            case 'focus': return 'Pomodoro'
            case 'shortBreak': return 'Short Break'
            case 'longBreak': return 'Long Break'
        }
    }, [mode, status])

    const getProgress = useCallback(() => {
        if (status === 'hyperfocus') return 1
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
