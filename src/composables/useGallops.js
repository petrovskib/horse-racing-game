import { ref, onUnmounted } from 'vue'

export function useGallop(intervalMs = 180) {
  const emojiFrame = ref('🐴')
  const intervalId = ref(null)

  function startGallop() {
    if (intervalId.value) return
    intervalId.value = setInterval(() => {
      emojiFrame.value = emojiFrame.value === '🐎' ? '🐴' : '🐎'
    }, intervalMs)
  }

  function stopGallop() {
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
    emojiFrame.value = '🐴'
  }

  onUnmounted(() => stopGallop())

  return { emojiFrame, startGallop, stopGallop }
}
