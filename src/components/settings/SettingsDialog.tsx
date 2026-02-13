'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Settings } from 'lucide-react'
import { useTimerStore } from '@/stores/timerStore'
import type { AppSettings } from '@/types'

export function SettingsDialog() {
    const settings = useTimerStore((s) => s.settings)
    const updateSettings = useTimerStore((s) => s.updateSettings)
    const [open, setOpen] = useState(false)
    const [draft, setDraft] = useState<AppSettings>(settings)

    const handleOpen = (isOpen: boolean) => {
        if (isOpen) setDraft({ ...settings })
        setOpen(isOpen)
    }

    const handleSave = () => {
        updateSettings(draft)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <button
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    aria-label="Settings"
                >
                    <Settings className="h-5 w-5" />
                </button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-white">Settings</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pb-2">
                    {/* Timer Durations */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                            Timer (minutes)
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Label className="text-xs text-zinc-500">Pomodoro</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={120}
                                    value={draft.focusDuration}
                                    onChange={(e) =>
                                        setDraft({ ...draft, focusDuration: +e.target.value || 1 })
                                    }
                                    className="bg-zinc-800 border-zinc-700 text-white h-9 text-center"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-zinc-500">Short Break</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={60}
                                    value={draft.shortBreakDuration}
                                    onChange={(e) =>
                                        setDraft({
                                            ...draft,
                                            shortBreakDuration: +e.target.value || 1,
                                        })
                                    }
                                    className="bg-zinc-800 border-zinc-700 text-white h-9 text-center"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-zinc-500">Long Break</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={60}
                                    value={draft.longBreakDuration}
                                    onChange={(e) =>
                                        setDraft({
                                            ...draft,
                                            longBreakDuration: +e.target.value || 1,
                                        })
                                    }
                                    className="bg-zinc-800 border-zinc-700 text-white h-9 text-center"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs text-zinc-500">
                                Pomodoros until long break
                            </Label>
                            <Input
                                type="number"
                                min={1}
                                max={12}
                                value={draft.pomodorosUntilLongBreak}
                                onChange={(e) =>
                                    setDraft({
                                        ...draft,
                                        pomodorosUntilLongBreak: +e.target.value || 1,
                                    })
                                }
                                className="bg-zinc-800 border-zinc-700 text-white h-9 w-20 text-center"
                            />
                        </div>
                    </section>

                    {/* Auto-start */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                            Auto-start
                        </h3>
                        <div className="flex items-center justify-between">
                            <Label className="text-sm text-zinc-300">Breaks</Label>
                            <Switch
                                checked={draft.autoStartBreaks}
                                onCheckedChange={(v) =>
                                    setDraft({ ...draft, autoStartBreaks: v })
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="text-sm text-zinc-300">Pomodoros</Label>
                            <Switch
                                checked={draft.autoStartPomodoros}
                                onCheckedChange={(v) =>
                                    setDraft({ ...draft, autoStartPomodoros: v })
                                }
                            />
                        </div>
                    </section>

                    {/* Sound */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                            Sound
                        </h3>
                        <div className="flex items-center justify-between">
                            <Label className="text-sm text-zinc-300">Alarm sound</Label>
                            <Switch
                                checked={draft.soundEnabled}
                                onCheckedChange={(v) =>
                                    setDraft({ ...draft, soundEnabled: v })
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-500">Volume</Label>
                            <Slider
                                min={0}
                                max={100}
                                step={5}
                                value={[draft.soundVolume * 100]}
                                onValueChange={([v]) =>
                                    setDraft({ ...draft, soundVolume: v / 100 })
                                }
                                className="w-full"
                            />
                        </div>
                    </section>

                    {/* Mode Colors */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                            Accent Colors
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'focus' as const, label: 'Pomodoro' },
                                { key: 'shortBreak' as const, label: 'Short Break' },
                                { key: 'longBreak' as const, label: 'Long Break' },
                                { key: 'hyperfocus' as const, label: 'Hyperfocus' },
                            ].map(({ key, label }) => (
                                <div key={key} className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={draft.modeColors[key]}
                                        onChange={(e) =>
                                            setDraft({
                                                ...draft,
                                                modeColors: {
                                                    ...draft.modeColors,
                                                    [key]: e.target.value,
                                                },
                                            })
                                        }
                                        className="w-8 h-8 rounded-full border-0 cursor-pointer bg-transparent [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-moz-color-swatch]:rounded-full"
                                    />
                                    <Label className="text-xs text-zinc-400">{label}</Label>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="color"
                                value={draft.dashboardAccent}
                                onChange={(e) =>
                                    setDraft({ ...draft, dashboardAccent: e.target.value })
                                }
                                className="w-8 h-8 rounded-full border-0 cursor-pointer bg-transparent [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-moz-color-swatch]:rounded-full"
                            />
                            <Label className="text-xs text-zinc-400">Dashboard</Label>
                        </div>
                    </section>

                    {/* Save */}
                    <Button
                        onClick={handleSave}
                        className="w-full bg-zinc-700 hover:bg-zinc-600 text-white"
                    >
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
