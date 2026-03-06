<template>
  <div class="race-lane">
    <div class="race-lane__number">{{ laneNumber }}</div>

    <div class="race-lane__track">
      <div class="race-lane__dashed-line"></div>
      <div class="race-lane__finish-line"></div>

      <div
        class="race-lane__horse"
        :class="{ 'race-lane__horse--running': isRunning }"
        :style="horseStyle"
      >
        <span
          class="race-lane__color-dot"
          :style="{ backgroundColor: horse.color.toLowerCase() }"
        ></span>
        <span class="race-lane__horse-icon">{{ emojiFrame }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { watch, onMounted } from 'vue'
import { useGallop } from '../../composables/useGallops.js'

export default {
  name: 'RaceLane',

  props: {
    horse: { type: Object, required: true },
    laneNumber: { type: Number, required: true },
    progress: { type: Number, default: 0 },
    isRunning: { type: Boolean, default: false },
  },

  setup(props) {
    const { emojiFrame, startGallop, stopGallop } = useGallop()

    onMounted(() => {
      if (props.isRunning) startGallop()
    })

    watch(
      () => props.isRunning,
      (val) => {
        val ? startGallop() : stopGallop()
      },
    )

    return { emojiFrame }
  },

  computed: {
    horseStyle() {
      // progress 0→1 mapped to 0%→88% of track width
      return { left: `${this.progress * 99}%` }
    },
  },
}
</script>

<style scoped>
.race-lane {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  height: 52px;
}

.race-lane__number {
  width: 32px;
  height: 32px;
  background: #555;
  color: white;
  font-size: 13px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin: 0 8px;
  border-radius: 2px;
}

.race-lane__track {
  flex: 1;
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.race-lane__dashed-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  border-top: 2px dashed #ddd;
  transform: translateY(-50%);
}

.race-lane__finish-line {
  position: absolute;
  right: 4px;
  top: 0;
  bottom: 0;
  width: 4px;
  z-index: 2;
  background: repeating-linear-gradient(to bottom, #c0392b 0px, #c0392b 6px, white 6px, white 12px);
}

.race-lane__horse {
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 1;
}

.race-lane__color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.race-lane__horse-icon {
  font-size: 22px;
  display: inline-block;
  transform: scaleX(-1);
}

.race-lane__horse--running .race-lane__horse-icon {
  animation: bounce 0.35s ease-in-out infinite;
}

@keyframes bounce {
  0% {
    transform: scaleX(-1) translateY(0px);
  }
  25% {
    transform: scaleX(-1) translateY(-3px);
  }
  50% {
    transform: scaleX(-1) translateY(0px);
  }
  75% {
    transform: scaleX(-1) translateY(-2px);
  }
  100% {
    transform: scaleX(-1) translateY(0px);
  }
}
</style>
