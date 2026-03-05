import {
  TOTAL_HORSES,
  MIN_HORSES,
  HORSE_COLORS,
  HORSE_NAMES,
  HORSES_PER_ROUND,
} from '../constants/raceConfig'

/**
 * Fisher-Yates shuffle algorithm.
 * Unlike sort(() => Math.random() - 0.5), this gives every
 * permutation an equal probability — truly unbiased.
 *
 * @param {Array} array - original array (not mutated)
 * @returns {Array} new shuffled array
 */
function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Generates a random number of horses between MIN_HORSES and TOTAL_HORSES.
 * Each horse gets a unique id, name, color, and random condition score.
 */
export function generateHorses() {
  const count = randomBetween(MIN_HORSES, TOTAL_HORSES)
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: HORSE_NAMES[index],
    color: HORSE_COLORS[index],
    condition: randomBetween(1, 100),
  }))
}

/**
 * Randomly selects a given number of horses using Fisher-Yates shuffle.
 * Never requests more horses than available in the pool.
 *
 * @param {Array} horses - full horse pool
 * @param {number} count - how many to select (default: HORSES_PER_ROUND)
 * @returns {Array} selected horses
 */
export function selectRandomHorses(horses, count = HORSES_PER_ROUND) {
  const safeCount = Math.min(count, horses.length)
  return shuffleArray(horses).slice(0, safeCount)
}

/**
 * Calculates the finishing order AND normalized speed for each horse.
 *
 * This is the SINGLE source of truth for both:
 * 1. The results panel (position 1st, 2nd, 3rd...)
 * 2. The race animation (how far each horse travels)
 *
 * By calculating once here and sharing the result, the visual
 * winner on the track will ALWAYS match the winner in results.
 *
 * @param {Array} horses - horses competing in this round
 * @returns {Array} sorted by position, each horse has:
 *   - position: finishing place (1 = winner)
 *   - speed: normalized 0→1 (winner = 1.0, used by animation)
 */
export function calculateRaceResult(horses) {
  // Step 1: assign each horse a performance score
  const withPerformance = horses.map((horse) => ({
    ...horse,
    performance: horse.condition * 0.7 + randomBetween(1, 100) * 0.3,
  }))

  // Step 2: sort by performance descending (best first)
  withPerformance.sort((a, b) => b.performance - a.performance)

  // Step 3: normalize speeds so winner = 1.0
  // All other horses are proportionally slower
  const maxPerformance = withPerformance[0].performance

  return withPerformance.map((horse, index) => ({
    ...horse,
    position: index + 1,
    speed: horse.performance / maxPerformance,
  }))
}

/**
 * Returns a random integer between min and max (inclusive).
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Converts a number to its ordinal string.
 * 1 → "1ST", 2 → "2ND", 3 → "3RD", 4 → "4TH"
 *
 * @param {number} n
 * @returns {string}
 */
export function toOrdinal(n) {
  const suffixes = ['TH', 'ST', 'ND', 'RD']
  const value = n % 100
  const suffix = suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]
  return `${n}${suffix}`
}
