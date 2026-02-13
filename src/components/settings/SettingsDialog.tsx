'use client'

import { useState } from 'react'
import { useTimerStore } from '@/stores/timerStore'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Settings } from 'lucide-react'
import type { AppSettings } from '@/types'

export function SettingsDialog() {
    const settings = useTimerStore((s) => s.settings)
    const updateSettings = useTimerStore((s) => s.updateSettings)
    const [open, setOpen] = useState(false)
    const [draft, setDraft] = useState<AppSettings>(settings)

    const handleOpen = (isOpen: boolean) => {
        if (isOpen) {
            setDraft({ ...settings })
        }
        setOpen(isOpen)
    }

    const handleSave = () => {
        updateSettings(draft)
        setOpen(false)
    }

    const updateDraft = (partial: Partial<AppSettings>) => {
        setDraft((prev) => ({ ...prev, ...partial }))
    }

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10 h-10 w-10 rounded-full"
                    aria-label="Settings"
                >
                    <Settings className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Settings</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-2">
                    {/* ─── Timer Durations ─── */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                            Timer
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-zinc-400">Focus (min)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={120}
                                    value={draft.focusDuration}
                                    onChange={(e) =>
                                        updateDraft({ focusDuration: Number(e.target.value) })
                                    }
                                    className="bg-zinc-800 border-zinc-700 text-white h-9"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-zinc-400">Short Break</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={60}
                                    value={draft.shortBreakDuration}
                                    onChange={(e) =>
                                        updateDraft({
                                            shortBreakDuration: Number(e.target.value),
                                        })
                                    }
                                    className="bg-zinc-800 border-zinc-700 text-white h-9"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-zinc-400">Long Break</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={60}
                                    value={draft.longBreakDuration}
                                    onChange={(e) =>
                                        updateDraft({
                                            longBreakDuration: Number(e.target.value),
                                        })
                                    }
                                    className="bg-zinc-800 border-zinc-700 text-white h-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400">
                                Pomodoros until long break
                            </Label>
                            <Input
                                type="number"
                                min={1}
                                max={10}
                                value={draft.pomodorosUntilLongBreak}
                                onChange={(e) =>
                                    updateDraft({
                                        pomodorosUntilLongBreak: Number(e.target.value),
                                    })
                                }
                                className="bg-zinc-800 border-zinc-700 text-white h-9 w-20"
                            />
                        </div>
                    </section>

                    {/* ─── Auto-start ─── */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                            Auto-start
                        </h3>
                        <div className="flex items-center justify-between">
                            <Label className="text-sm text-zinc-300">Breaks</Label>
                            <Switch
                                checked={draft.autoStartBreaks}
                                onCheckedChange={(v) =>
                                    updateDraft({ autoStartBreaks: v })
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="text-sm text-zinc-300">Pomodoros</Label>
                            <Switch
                                checked={draft.autoStartPomodoros}
                                onCheckedChange={(v) =>
                                    updateDraft({ autoStartPomodoros: v })
                                }
                            />
                        </div>
                    </section>

                    {/* ─── Sound ─── */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                            Sound
                        </h3>
                        <div className="flex items-center justify-between">
                            <Label className="text-sm text-zinc-300">Alarm sound</Label>
                            <Switch
                                checked={draft.soundEnabled}
                                onCheckedChange={(v) =>
                                    updateDraft({ soundEnabled: v })
                                }
                            />
                        </div>
                        {draft.soundEnabled && (
                            <div className="space-y-1.5">
                                <Label className="text-xs text-zinc-400">Volume</Label>
                                <Slider
                                    value={[draft.soundVolume * 100]}
                                    onValueChange={([v]) =>
                                        updateDraft({ soundVolume: v / 100 })
                                    }
                                    min={0}
                                    max={100}
                                    step={5}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </section>

                    {/* ─── Appearance ─── */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                            Appearance
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-zinc-400">Focus</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={draft.modeColors.focus}
                                        onChange={(e) =>
                                            updateDraft({
                                                modeColors: {
                                                    ...draft.modeColors,
                                                    focus: e.target.value,
                                                },
                                            })
                                        }
                                        className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                                    />
                                    <span className="text-xs text-zinc-500 font-mono">
                                        {draft.modeColors.focus}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-zinc-400">Short</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={draft.modeColors.shortBreak}
                                        onChange={(e) =>
                                            updateDraft({
                                                modeColors: {
                                                    ...draft.modeColors,
                                                    shortBreak: e.target.value,
                                                },
                                            })
                                        }
                                        className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                                    />
                                    <span className="text-xs text-zinc-500 font-mono">
                                        {draft.modeColors.shortBreak}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-zinc-400">Long</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={draft.modeColors.longBreak}
                                        onChange={(e) =>
                                            updateDraft({
                                                modeColors: {
                                                    ...draft.modeColors,
                                                    longBreak: e.target.value,
                                                },
                                            })
                                        }
                                        className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                                    />
                                    <span className="text-xs text-zinc-500 font-mono">
                                        {draft.modeColors.longBreak}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="text-sm text-zinc-300">
                                Black background on focus
                            </Label>
                            <Switch
                                checked={draft.blackBgOnFocus}
                                onCheckedChange={(v) =>
                                    updateDraft({ blackBgOnFocus: v })
                                }
                            />
                        </div>
                    </section>

                    {/* ─── Save ─── */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-white text-black hover:bg-zinc-200 font-semibold"
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
