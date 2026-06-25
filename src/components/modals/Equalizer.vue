<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import Modal from '../particles/Modal.vue'
import { useMusicStore } from '@/stores/main'

const emits = defineEmits(['close'])

const store = useMusicStore()

const canvasRef = ref<HTMLCanvasElement>()

let animationId = 0

const drawSpectrum = () => {
  if (!canvasRef.value || !store.analyser)
    return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  if (!ctx)
    return

  const analyser = store.analyser

  const data = new Uint8Array(analyser.frequencyBinCount)

  const render = () => {
    animationId = requestAnimationFrame(render)

    analyser.getByteFrequencyData(data)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const width = canvas.width / data.length

    data.forEach((value, index) => {
      const h = (value / 255) * canvas.height

      ctx.fillStyle =
        'rgba(103,80,164,0.7)'

      ctx.fillRect(
        index * width,
        canvas.height - h,
        width,
        h
      )
    })
  }

  render()
}

onMounted(() => {
  drawSpectrum()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})
</script>

<template>
  <Modal
    title="Эквалайзер"
    @close="() => emits('close')"
  >
    <div class="equalizer">
      <canvas
        ref="canvasRef"
        width="900"
        height="180"
        class="visualizer"
      />

      <div class="bands">
        <div
          v-for="(band, index) in store.equalizerBands"
          :key="band.freq"
          class="band"
        >
          <span>{{ band.gain }} dB</span>

          <input
            type="range"
            min="-12"
            max="12"
            step="0.5"
            :value="band.gain"
            @input="
              store.updateBand(
                index,
                Number(
                  ($event.target as HTMLInputElement)
                    .value
                )
              )
            "
          />

          <label>
            {{ band.freq >= 1000
              ? `${band.freq / 1000}k`
              : band.freq }}
          </label>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.equalizer {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.visualizer {
  width: 100%;
  height: 180px;

  border-radius: 24px;

  background: rgba(255,255,255,.05);

  backdrop-filter: blur(20px);
}

.bands {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.band {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  flex: 1;
}

.band span {
  font-size: 12px;
  color: var(--md-sys-color-on-surface);
}

.band label {
  font-size: 12px;
  color: var(--md-sys-color-outline);
}

.band input[type='range'] {
  writing-mode: vertical-lr;
  direction: rtl;

  width: 8px;
  height: 180px;

  accent-color: #6750a4;
}
</style>