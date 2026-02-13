'use client'

import { useState, useMemo } from 'react'
import { DayCell } from './DayCell'
import { MonthNavigator } from './MonthNavigator'
import type { DayStats } from '@/types'

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface HeatmapCalendarProps {
    sessions: DayStats[]
    accentColor: string
}

function getCalendarGrid(year: number, month: number) {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    // getDay(): 0=Sun, 1=Mon ... 6=Sat
    // We want Mon=0, so adjust
    let startDay = firstDay.getDay() - 1
    if (startDay < 0) startDay = 6

    const grid: (number | null)[] = []

    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
        grid.push(null)
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
        grid.push(d)
    }

    return grid
}

function hexToRgba(hex: string, alpha: number): string {
    if (!hex || hex.length < 7) return `rgba(139, 92, 246, ${alpha})`
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function HeatmapCalendar({ sessions, accentColor }: HeatmapCalendarProps) {
    const today = new Date()
    const [year, setYear] = useState(today.getFullYear())
    const [month, setMonth] = useState(today.getMonth())

    const grid = useMemo(() => getCalendarGrid(year, month), [year, month])

    // Build a map of day -> totalMinutes for the current month
    const dayMap = useMemo(() => {
        const map = new Map<number, number>()
        sessions.forEach((s) => {
            const date = new Date(s.date)
            if (date.getFullYear() === year && date.getMonth() === month) {
                map.set(date.getDate(), s.totalMinutes)
            }
        })
        return map
    }, [sessions, year, month])

    const totalMinutes = useMemo(() => {
        let total = 0
        dayMap.forEach((minutes) => {
            total += minutes
        })
        return total
    }, [dayMap])

    const handlePrevious = () => {
        if (month === 0) {
            setYear(year - 1)
            setMonth(11)
        } else {
            setMonth(month - 1)
        }
    }

    const handleNext = () => {
        if (month === 11) {
            setYear(year + 1)
            setMonth(0)
        } else {
            setMonth(month + 1)
        }
    }

    const isToday = (day: number | null) => {
        if (day === null) return false
        return (
            year === today.getFullYear() &&
            month === today.getMonth() &&
            day === today.getDate()
        )
    }

    // Generate intensity colors based on accent color
    const intensityColors = useMemo(() => [
        'transparent',
        hexToRgba(accentColor, 0.2),
        hexToRgba(accentColor, 0.4),
        hexToRgba(accentColor, 0.65),
        hexToRgba(accentColor, 0.9),
    ], [accentColor])

    return (
        <div className="space-y-4">
            <MonthNavigator
                year={year}
                month={month}
                onPrevious={handlePrevious}
                onNext={handleNext}
                totalMinutes={totalMinutes}
            />

            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1.5">
                {WEEK_DAYS.map((d) => (
                    <div
                        key={d}
                        className="text-center text-xs text-zinc-500 font-medium py-1"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1.5">
                {grid.map((day, i) => (
                    <DayCell
                        key={i}
                        day={day}
                        totalMinutes={day !== null ? (dayMap.get(day) ?? 0) : 0}
                        isToday={isToday(day)}
                        intensityColors={intensityColors}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 pt-2">
                <span className="text-[10px] text-zinc-500">Less</span>
                {intensityColors.map((color, i) => (
                    <div
                        key={i}
                        className="w-4 h-4 rounded-sm"
                        style={{ backgroundColor: i === 0 ? 'rgba(255,255,255,0.05)' : color }}
                    />
                ))}
                <span className="text-[10px] text-zinc-500">More</span>
            </div>
        </div>
    )
}
