'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthNavigatorProps {
    year: number
    month: number // 0-indexed
    onPrevious: () => void
    onNext: () => void
    totalMinutes: number
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]

export function MonthNavigator({
    year,
    month,
    onPrevious,
    onNext,
    totalMinutes,
}: MonthNavigatorProps) {
    const totalHours = Math.floor(totalMinutes / 60)
    const remainingMin = totalMinutes % 60

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onPrevious}
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8"
                    aria-label="Previous month"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-bold text-white min-w-[140px] text-center">
                    {MONTH_NAMES[month]} {year}
                </h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNext}
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8"
                    aria-label="Next month"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            <div className="text-sm text-zinc-400 font-mono tabular-nums">
                {totalHours}h {remainingMin}min
            </div>
        </div>
    )
}
