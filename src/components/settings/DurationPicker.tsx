'use client'

import { ChevronUp, ChevronDown } from 'lucide-react'

interface DurationPickerProps {
    value: number
    onChange: (value: number) => void
    min: number
    max: number
    step?: number
    label: string
    unit?: string
}

export function DurationPicker({
    value,
    onChange,
    min,
    max,
    step = 1,
    label,
    unit = 'min',
}: DurationPickerProps) {
    const decrement = () => onChange(Math.max(min, value - step))
    const increment = () => onChange(Math.min(max, value + step))

    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-zinc-500 font-medium">{label}</span>
            <div className="flex flex-col items-center bg-zinc-800 rounded-lg border border-zinc-700/50 px-4 py-1 min-w-[72px]">
                <button
                    onClick={increment}
                    disabled={value >= max}
                    className="text-zinc-400 hover:text-white disabled:text-zinc-700 transition-colors p-0.5"
                    aria-label={`Increase ${label}`}
                >
                    <ChevronUp className="h-4 w-4" />
                </button>
                <span className="text-xl font-bold text-white tabular-nums text-center leading-tight">
                    {value}
                </span>
                <button
                    onClick={decrement}
                    disabled={value <= min}
                    className="text-zinc-400 hover:text-white disabled:text-zinc-700 transition-colors p-0.5"
                    aria-label={`Decrease ${label}`}
                >
                    <ChevronDown className="h-4 w-4" />
                </button>
            </div>
            <span className="text-[10px] text-zinc-600">{unit}</span>
        </div>
    )
}
