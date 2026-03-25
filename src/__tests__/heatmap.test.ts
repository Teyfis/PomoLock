import { describe, it, expect } from 'vitest'
import { getHeatmapIntensity, type HeatmapIntensity } from '@/types'

describe('Heatmap Intensity', () => {
    const cases: [number, HeatmapIntensity][] = [
        [0, 0],       // 0 minutes -> no intensity
        [30, 1],      // 0.5h -> level 1
        [60, 1],      // 1h -> level 1
        [119, 1],     // 1h59m -> level 1
        [120, 2],     // 2h -> level 2
        [180, 2],     // 3h -> level 2
        [239, 2],     // 3h59m -> level 2
        [240, 3],     // 4h -> level 3
        [300, 3],     // 5h -> level 3
        [359, 3],     // 5h59m -> level 3
        [360, 4],     // 6h -> level 4
        [600, 4],     // 10h -> level 4
        [1440, 4],    // 24h -> level 4
    ]

    it.each(cases)(
        'should return intensity %i for %i minutes',
        (minutes, expected) => {
            expect(getHeatmapIntensity(minutes)).toBe(expected)
        }
    )
})
