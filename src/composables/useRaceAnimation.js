import { ref, onUnmounted } from 'vue'
import { RACE_DURATION_MS } from '../constants/raceConfig'

export function useRaceAnimation() {
  const horseProgress = ref({})
  const animationId = ref(null)
  const startTime = ref(null)

  let elapsedBeforePause = 0
  let horseSpeeds = {}

  function prepareRound(roundResult) {
    horseSpeeds = {}
    roundResult.forEach((horse) => {
      horseSpeeds[horse.id] = horse.speed
    })
  }

  function resetProgress(horses) {
    const initial = {}
    horses.forEach((horse) => {
      initial[horse.id] = 0
    })
    horseProgress.value = initial
    startTime.value = null
    elapsedBeforePause = 0
  }

  function startAnimation() {
    stopAnimation()
    animationId.value = requestAnimationFrame(onFrame)
  }

  function stopAnimation() {
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
      animationId.value = null
    }
    if (startTime.value !== null) {
      elapsedBeforePause = Date.now() - startTime.value + elapsedBeforePause
    }
    startTime.value = null
  }

  function onFrame(timestamp) {
    if (!startTime.value) {
      startTime.value = Date.now()
    }

    const elapsed = Date.now() - startTime.value + elapsedBeforePause
    const progress = Math.min(elapsed / RACE_DURATION_MS, 1)

    const updated = {}
    Object.keys(horseSpeeds).forEach((id) => {
      updated[id] = Math.min(progress * horseSpeeds[id], 1)
    })
    horseProgress.value = updated

    if (progress < 1) {
      animationId.value = requestAnimationFrame(onFrame)
    } else {
      animationId.value = null
    }
  }

  onUnmounted(() => stopAnimation())

  return {
    horseProgress,
    prepareRound,
    resetProgress,
    startAnimation,
    stopAnimation,
  }
}
