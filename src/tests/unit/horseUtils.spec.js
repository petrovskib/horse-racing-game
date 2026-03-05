import { describe, it, expect } from 'vitest'
import {
  generateHorses,
  selectRandomHorses,
  calculateRaceResult,
  randomBetween,
  toOrdinal,
} from '../../utils/horseUtils.js'
import {
  TOTAL_HORSES,
  HORSES_PER_ROUND,
  HORSE_COLORS,
  HORSE_NAMES,
} from '../../constants/raceConfig.js'

// ─────────────────────────────────────────────
// generateHorses()
// ─────────────────────────────────────────────
describe('generateHorses()', () => {
  it('generates exactly 20 horses', () => {
    const horses = generateHorses()
    expect(horses).toHaveLength(TOTAL_HORSES)
  })

  it('gives each horse a unique id', () => {
    const horses = generateHorses()
    const ids = horses.map((h) => h.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(TOTAL_HORSES)
  })

  it('gives each horse a unique color from the color list', () => {
    const horses = generateHorses()
    horses.forEach((horse, index) => {
      expect(horse.color).toBe(HORSE_COLORS[index])
    })
  })

  it('gives each horse a name from the names list', () => {
    const horses = generateHorses()
    horses.forEach((horse) => {
      expect(HORSE_NAMES).toContain(horse.name)
    })
  })

  it('gives each horse a condition between 1 and 100', () => {
    const horses = generateHorses()
    horses.forEach((horse) => {
      expect(horse.condition).toBeGreaterThanOrEqual(1)
      expect(horse.condition).toBeLessThanOrEqual(100)
    })
  })

  it('each horse has required fields: id, name, color, condition', () => {
    const horses = generateHorses()
    horses.forEach((horse) => {
      expect(horse).toHaveProperty('id')
      expect(horse).toHaveProperty('name')
      expect(horse).toHaveProperty('color')
      expect(horse).toHaveProperty('condition')
    })
  })
})

// ─────────────────────────────────────────────
// selectRandomHorses()
// ─────────────────────────────────────────────
describe('selectRandomHorses()', () => {
  const horses = generateHorses()

  it('selects exactly 10 horses by default', () => {
    const selected = selectRandomHorses(horses)
    expect(selected).toHaveLength(HORSES_PER_ROUND)
  })

  it('selects a custom count when specified', () => {
    const selected = selectRandomHorses(horses, 5)
    expect(selected).toHaveLength(5)
  })

  it('only selects horses from the original list', () => {
    const selected = selectRandomHorses(horses)
    const originalIds = horses.map((h) => h.id)
    selected.forEach((horse) => {
      expect(originalIds).toContain(horse.id)
    })
  })

  it('does not mutate the original array', () => {
    const original = generateHorses()
    const originalLength = original.length
    selectRandomHorses(original)
    expect(original).toHaveLength(originalLength)
  })

  it('returns different selections on repeated calls (randomness check)', () => {
    // Run 5 times — extremely unlikely to get same order every time
    const results = Array.from({ length: 5 }, () =>
      selectRandomHorses(horses)
        .map((h) => h.id)
        .join(','),
    )
    const unique = new Set(results)
    expect(unique.size).toBeGreaterThan(1)
  })
})

// ─────────────────────────────────────────────
// calculateRaceResult()
// ─────────────────────────────────────────────
describe('calculateRaceResult()', () => {
  const horses = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Horse ${i}`,
    color: 'Red',
    condition: randomBetween(1, 100),
  }))

  it('returns same number of horses as input', () => {
    const result = calculateRaceResult(horses)
    expect(result).toHaveLength(horses.length)
  })

  it('assigns sequential positions 1 through N', () => {
    const result = calculateRaceResult(horses)
    const positions = result.map((h) => h.position).sort((a, b) => a - b)
    positions.forEach((pos, i) => expect(pos).toBe(i + 1))
  })

  it('winner has speed of exactly 1.0', () => {
    const result = calculateRaceResult(horses)
    const winner = result.find((h) => h.position === 1)
    expect(winner.speed).toBe(1.0)
  })

  it('all speeds are between 0 and 1', () => {
    const result = calculateRaceResult(horses)
    result.forEach((horse) => {
      expect(horse.speed).toBeGreaterThan(0)
      expect(horse.speed).toBeLessThanOrEqual(1)
    })
  })

  it('winner speed is greater than all other speeds', () => {
    const result = calculateRaceResult(horses)
    const winner = result.find((h) => h.position === 1)
    result
      .filter((h) => h.position !== 1)
      .forEach((h) => expect(winner.speed).toBeGreaterThanOrEqual(h.speed))
  })

  it('does not mutate the input array', () => {
    const input = [...horses]
    const inputIds = input.map((h) => h.id).join(',')
    calculateRaceResult(input)
    expect(input.map((h) => h.id).join(',')).toBe(inputIds)
  })

  it('higher condition horses tend to finish better', () => {
    const strongHorse = { id: 1, name: 'Strong', color: 'Red', condition: 100 }
    const weakHorse = { id: 2, name: 'Weak', color: 'Blue', condition: 1 }
    let strongWins = 0
    for (let i = 0; i < 100; i++) {
      const result = calculateRaceResult([strongHorse, weakHorse])
      if (result[0].id === strongHorse.id) strongWins++
    }
    expect(strongWins).toBeGreaterThan(60)
  })
})

// ─────────────────────────────────────────────
// randomBetween()
// ─────────────────────────────────────────────
describe('randomBetween()', () => {
  it('returns a number within the given range', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomBetween(5, 15)
      expect(result).toBeGreaterThanOrEqual(5)
      expect(result).toBeLessThanOrEqual(15)
    }
  })

  it('returns an integer', () => {
    for (let i = 0; i < 20; i++) {
      expect(Number.isInteger(randomBetween(1, 100))).toBe(true)
    }
  })

  it('works when min equals max', () => {
    expect(randomBetween(7, 7)).toBe(7)
  })
})

// ─────────────────────────────────────────────
// toOrdinal()
// ─────────────────────────────────────────────
describe('toOrdinal()', () => {
  it('converts 1 to 1ST', () => expect(toOrdinal(1)).toBe('1ST'))
  it('converts 2 to 2ND', () => expect(toOrdinal(2)).toBe('2ND'))
  it('converts 3 to 3RD', () => expect(toOrdinal(3)).toBe('3RD'))
  it('converts 4 to 4TH', () => expect(toOrdinal(4)).toBe('4TH'))
  it('converts 6 to 6TH', () => expect(toOrdinal(6)).toBe('6TH'))
})
