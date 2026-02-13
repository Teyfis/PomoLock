import { describe, it, expect } from 'vitest'
import { getHeatmapIntensity, type HeatmapIntensity } from '@/types'

describe('Heatmap Intensity', () => {
    const cases: [number, HeatmapIntensity][] = [
        [0, 0],       // 0 minutes -> no intensity
        [30, 1],      // 0.5h -> level 1
        [120, 1],     // 2h -> level 1
        [239, 1],     // 3h59m -> level 1
        [240, 2],     // 4h -> level 2
        [360, 2],     // 6h -> level 2
        [419, 2],     // 6h59m -> level 2
        [420, 3],     // 7h -> level 3
        [540, 3],     // 9h -> level 3
        [599, 3],     // 9h59m -> level 3
        [600, 4],     // 10h -> level 4
        [720, 4],     // 12h -> level 4
        [1440, 4],    // 24h -> level 4
    ]

    it.each(cases)(
        'should return intensity %i for %i minutes',
        (minutes, expected) => {
            expect(getHeatmapIntensity(minutes)).toBe(expected)
        }
    )
})
