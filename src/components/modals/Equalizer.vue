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
        ctx.shadowBlur = 20
        ctx.shadowColor = store.colors.secondary
        animationId = requestAnimationFrame(render)

        analyser.getByteFrequencyData(data)

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const width = canvas.width / data.length

        ctx.beginPath()

        ctx.lineWidth = 3
        ctx.strokeStyle = store.colors.primary

        const step = canvas.width / data.length

        let x = 0

        ctx.moveTo(
            0,
            canvas.height
        )

        for (let i = 0; i < data.length; i++) {
            const y =
                canvas.height -
                (data[i] / 255) * canvas.height

            const xc = x + step / 2

            const yc =
                canvas.height -
                (
                    ((data[i] ?? 0) +
                        (data[i + 1] ?? data[i])) /
                    2
                ) /
                255 *
                canvas.height

            ctx.quadraticCurveTo(
                x,
                y,
                xc,
                yc
            )

            x += step
        }

        ctx.stroke()
        ctx.lineTo(
            canvas.width,
            canvas.height
        )

        ctx.lineTo(
            0,
            canvas.height
        )

        ctx.closePath()

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                canvas.height
            )

        gradient.addColorStop(
            0,
            'rgba(208,188,255,0.35)'
        )

        gradient.addColorStop(
            1,
            'rgba(208,188,255,0)'
        )

        ctx.fillStyle = gradient
        ctx.fill()
    }

    render()
}

const presetNames = Object.keys(
    store.presets
) as Array<keyof typeof store.presets>

onMounted(() => {
    drawSpectrum()
})

onUnmounted(() => {
    cancelAnimationFrame(animationId)
})
</script>

<template>
    <Modal title="Эквалайзер" @close="() => emits('close')">
        <div class="equalizer">
            <canvas ref="canvasRef" width="900" height="180" class="visualizer" />
            <div class="presets">
                <button v-for="preset in presetNames" :key="preset" class="preset-btn" :class="{
                    active:
                        store.currentPreset === preset
                }" @click="store.applyPreset(preset)">
                    {{ preset }}
                </button>

                <button class="preset-btn reset" @click="store.resetEqualizer()">
                    Сброс
                </button>
            </div>
            <div class="bands">
                <div v-for="(band, index) in store.equalizerBands" :key="band.freq" class="band">
                    <span>{{ band.gain }} dB</span>

                    <input type="range" min="-12" max="12" step="0.5" :value="band.gain" @input="
                        store.updateBand(
                            index,
                            Number(
                                ($event.target as HTMLInputElement)
                                    .value
                            )
                        )
                        " />

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

.presets {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    padding: 0 20px;
}

.preset-btn {
    height: 40px;

    padding: 0 16px;

    border: none;

    border-radius: 999px;

    cursor: pointer;

    transition:
        background .2s,
        color .2s,
        transform .15s;

    background:
        var(--secondary-color);

    color:
        var(--text-secondary-color);
}

.preset-btn:hover {
    transform: translateY(-1px);
}

.preset-btn.active {
    background:
        var(--triary-color);

    color:
        var(--text-secondary-color);

    box-shadow:
        0 0 16px rgba(103, 80, 164, .4);
}

.preset-btn.reset {
    margin-left: auto;

    background:
        var(--on-primary-color);

    color:
        var(--text-primary-color);
}

.visualizer {
    width: 100%;
    height: 180px;

    border-radius: 24px;

    background: rgba(255, 255, 255, .05);

    backdrop-filter: blur(20px);
}

.bands {
    display: flex;
    justify-content: space-between;
    gap: 16px;
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
    color: var(--text-primary-color);
}

.band label {
    font-size: 12px;
    color: var(--text-primary-color);
}

.band input[type='range'] {
    writing-mode: vertical-lr;
    direction: rtl;

    width: 8px;
    height: 180px;

    accent-color: var(--primary-color);
}
</style>