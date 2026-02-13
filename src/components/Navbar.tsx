'use client'

import Link from 'next/link'
import { SettingsDialog } from '@/components/settings/SettingsDialog'
import { BarChart3, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between">
            <Link
                href="/"
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
                <Timer className="h-5 w-5" />
                <span className="font-bold text-lg tracking-tight hidden sm:inline">
                    Pomodoro
                </span>
            </Link>

            <div className="flex items-center gap-1">
                <Link href="/dashboard">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/70 hover:text-white hover:bg-white/10 h-10 w-10 rounded-full"
                        aria-label="Dashboard"
                    >
                        <BarChart3 className="h-5 w-5" />
                    </Button>
                </Link>
                <SettingsDialog />
            </div>
        </nav>
    )
}
