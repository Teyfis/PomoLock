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
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Settings } from 'lucide-react'
import { useTimerStore } from '@/stores/timerStore'
import { DurationPicker } from './DurationPicker'
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
                    {/* Timer Durations — DurationPicker */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                            Timer
                        </h3>
                        <div className="flex justify-around">
                            <DurationPicker
                                label="Pomodoro"
                                value={draft.focusDuration}
                                onChange={(v) => setDraft({ ...draft, focusDuration: v })}
                                min={1}
                                max={120}
                            />
                            <DurationPicker
                                label="Short Break"
                                value={draft.shortBreakDuration}
                                onChange={(v) => setDraft({ ...draft, shortBreakDuration: v })}
                                min={1}
                                max={60}
                            />
                            <DurationPicker
                                label="Long Break"
                                value={draft.longBreakDuration}
                                onChange={(v) => setDraft({ ...draft, longBreakDuration: v })}
                                min={1}
                                max={60}
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                            <Label className="text-xs text-zinc-500">
                                Pomodoros until long break
                            </Label>
                            <DurationPicker
                                label=""
                                value={draft.pomodorosUntilLongBreak}
                                onChange={(v) => setDraft({ ...draft, pomodorosUntilLongBreak: v })}
                                min={1}
                                max={12}
                                unit=""
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
