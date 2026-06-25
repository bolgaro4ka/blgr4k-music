<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import Modal from '../particles/Modal.vue'
import { useMusicStore } from '@/stores/main'

const emits = defineEmits(['close'])
const store = useMusicStore()

// --- Frequency bands ---
interface Band {
  frequency: number
  label: string
}

const bands: Band[] = [
  { frequency: 32, label: '32' },
  { frequency: 64, label: '64' },
  { frequency: 125, label: '125' },
  { frequency: 250, label: '250' },
  { frequency: 500, label: '500' },
  { frequency: 1000, label: '1k' },
  { frequency: 2000, label: '2k' },
  { frequency: 4000, label: '4k' },
  { frequency: 8000, label: '8k' },
  { frequency: 16000, label: '16k' },
]

// Gain values for each band (dB)
const gains = ref<number[]>(Array(bands.length).fill(0))

// --- Audio graph ---
const audioContext = ref<AudioContext | null>(null)
let sourceNode: MediaElementAudioSourceNode | null = null
let filters: BiquadFilterNode[] = []
let analyser: AnalyserNode | null = null

// Canvas for visualization
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationFrameId: number | null = null

// Material You 3 color mappings
const rootStyle = computed(() => ({
  '--md-primary': store.colors.primary,
  '--md-surface': store.colors.surface,
  '--md-background': store.colors.background,
  '--md-on-primary': store.colors.onPrimary,
  '--md-secondary': store.colors.secondary,
  '--md-tertiary': store.colors.tertiary,
  '--md-outline': store.colors.outline,
  '--md-text-primary': store.colors.textPrimary,
  '--md-text-secondary': store.colors.textSecondary,
}))

// --- Audio processing setup ---
async function initAudioGraph(audioEl: HTMLAudioElement) {
  if (!window.AudioContext) return

  const ctx = new AudioContext()
  audioContext.value = ctx
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }

  sourceNode = ctx.createMediaElementSource(audioEl)

  analyser = ctx.createAnalyser()
  analyser.fftSize = 256

  filters = bands.map((band, i) => {
    const filter = ctx.createBiquadFilter()
    filter.type = 'peaking'
    filter.frequency.value = band.frequency
    filter.Q.value = 1.0
    filter.gain.value = gains.value[i]
    return filter
  })

  // Chain: source → filters → analyser → destination
  sourceNode.connect(filters[0])
  for (let i = 0; i < filters.length - 1; i++) {
    filters[i].connect(filters[i + 1])
  }
  filters[filters.length - 1].connect(analyser)
  analyser.connect(ctx.destination)
}

function reconnectSource(audioEl: HTMLAudioElement) {
  if (!audioContext.value || !sourceNode) return
  sourceNode.disconnect()
  sourceNode = audioContext.value.createMediaElementSource(audioEl)
  if (filters.length) sourceNode.connect(filters[0])
}

function closeAudioGraph() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  if (audioContext.value) {
    audioContext.value.close()
    audioContext.value = null
    sourceNode = null
    filters = []
    analyser = null
  }
}

// --- Reactivity: audio source changes ---
watch(
  () => store.currentAudio,
  (newAudio, oldAudio) => {
    // Cleanup when audio is removed
    if (oldAudio && !newAudio) {
      closeAudioGraph()
      return
    }
    if (!newAudio) return

    // Initialize or reconnect
    if (!audioContext.value) {
      initAudioGraph(newAudio)
    } else {
      reconnectSource(newAudio)
    }
  },
  { immediate: true }
)

// Update filter gains when sliders move
watch(
  gains,
  (newGains) => {
    if (!filters.length) return
    newGains.forEach((gain, i) => {
      if (filters[i]) {
        filters[i].gain.value = gain
      }
    })
  },
  { deep: true }
)

// --- Frequency visualization ---
function drawVisualization() {
  if (!analyser || !canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  const render = () => {
    animationFrameId = requestAnimationFrame(render)

    // Resize canvas to match container
    const container = canvas.parentElement
    if (container) {
      const rect = container.getBoundingClientRect()
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width
        canvas.height = rect.height
      }
    }

    analyser!.getByteFrequencyData(dataArray)

    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)

    const barCount = bufferLength
    const barWidth = (width / barCount) * 2.5
    let x = 0

    ctx.fillStyle = store.colors.primary
    for (let i = 0; i < barCount; i++) {
      const barHeight = (dataArray[i] / 255) * height
      ctx.fillRect(x, height - barHeight, barWidth, barHeight)
      x += barWidth + 1
    }
  }

  render()
}

// Start/stop visualization based on analyser existence
watch(analyser, (newVal) => {
  if (newVal && canvasRef.value) {
    drawVisualization()
  } else {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }
})

// Cleanup on unmount (only animation, context stays for audio)
onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
})

// --- Helpers ---
function resetEQ() {
  gains.value = Array(bands.length).fill(0)
}
</script>

<template>
  <Modal title="Эквалайзер" @close="emits('close')">
    <div class="equalizer-root" :style="rootStyle">
      <div class="equalizer-container">
        <canvas ref="canvasRef" class="visualization-canvas" />
        <div class="sliders-row">
          <div
            v-for="(band, index) in bands"
            :key="band.frequency"
            class="slider-column"
          >
            <span class="gain-value">{{ gains[index] > 0 ? '+' : '' }}{{ gains[index] }} dB</span>
            <div class="slider-wrapper">
              <input
                type="range"
                class="vertical-slider"
                :min="-12"
                :max="12"
                step="0.5"
                v-model.number="gains[index]"
              />
            </div>
            <span class="freq-label">{{ band.label }}</span>
          </div>
        </div>
        <button class="reset-btn" @click="resetEQ">Сбросить</button>
      </div>
    </div>
  </Modal>
</template>

<style lang="scss" scoped>
.equalizer-root {
  background: var(--md-background);
  color: var(--md-text-primary);
  border-radius: 28px;
  overflow: hidden;
}

.equalizer-container {
  position: relative;
  width: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.visualization-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.25;
  pointer-events: none;
  border-radius: inherit;
}

.sliders-row {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.slider-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 50px;
}

.gain-value,
.freq-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--md-text-secondary);
}

.slider-wrapper {
  width: 32px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vertical-slider {
  -webkit-appearance: none;
  background: transparent;
  width: 200px; /* becomes visual height after rotation */
  height: 32px;
  transform: rotate(-90deg);
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    height: 4px;
    background: var(--md-outline);
    border-radius: 2px;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: var(--md-primary);
    border-radius: 50%;
    margin-top: -8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    transition: transform 0.15s;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }
}

.reset-btn {
  position: relative;
  z-index: 1;
  margin-top: 8px;
  background: var(--md-primary);
  color: var(--md-on-primary);
  border: none;
  border-radius: 20px;
  padding: 8px 24px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}
</style>