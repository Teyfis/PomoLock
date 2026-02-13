'use client'

import { Timer } from '@/components/timer/Timer'
import { SettingsDialog } from '@/components/settings/SettingsDialog'

export default function Home() {
  return (
    <>
      {/* Settings gear floating top-right */}
      <div className="fixed top-4 right-4 z-50">
        <SettingsDialog />
      </div>
      <Timer />
    </>
  )
}
