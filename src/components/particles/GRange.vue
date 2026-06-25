<template>
    <div ref="container" class="material-slider" :style="containerStyle" @mousedown="startDrag" @touchstart="startDrag">
        <canvas ref="canvas" :width="canvasWidth * devicePixelRatio" :height="canvasHeight * devicePixelRatio"
            class="slider-canvas"></canvas>
        <!-- Скрытый нативный input для доступности и событий change -->
        <input type="range" :min="min" :max="max" :step="step" :value="modelValue" @input="onNativeInput"
            @change="onNativeChange" class="hidden-input" ref="input" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

interface Props {
    modelValue: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;               // Material You primary color
    inactiveColor?: string;        // цвет неактивной линии и тени (по умолчанию серый)
    waveCount?: number;            // количество волн на всю ширину
    amplitude?: number;            // амплитуда волны в пикселях
    height?: number;               // высота canvas в CSS пикселях
    pauseAnimation?: boolean;      // остановка анимации волны
    thumbBorderColor?: string;     // цвет обводки thumb (по умолчанию белый)
}

const props = withDefaults(defineProps<Props>(), {
    min: 0,
    max: 100,
    step: 1,
    color: '#6200ee',
    inactiveColor: 'rgba(0,0,0,0.2)',
    waveCount: 3,
    amplitude: 8,
    height: 60,
    pauseAnimation: false,
    thumbBorderColor: '#ffffff',
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void;
    (e: 'change', value: number): void;
}>();

// Элементы
const container = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const input = ref<HTMLInputElement | null>(null);

// Состояние
const canvasWidth = ref<number>(0); // логическая ширина в CSS пикселях
const canvasHeight = computed<number>(() => props.height);
const phase = ref<number>(0);
const isDragging = ref<boolean>(false);
const animationFrame = ref<number | null>(null);
const isAnimating = ref<boolean>(false);
const devicePixelRatio = window.devicePixelRatio || 1;

// Проценты и позиции
const percent = computed<number>(() => {
    return (props.modelValue - props.min) / (props.max - props.min);
});

const thumbX = computed<number>(() => {
    return percent.value * canvasWidth.value;
});

const baseY = computed<number>(() => canvasHeight.value / 2);

const containerStyle = computed<Record<string, string | number>>(() => ({
    position: 'relative',
    width: '100%',
    height: `${canvasHeight.value}px`,
    touchAction: 'none',
    cursor: 'pointer'
}));

// Обновление размера canvas
const updateCanvasSize = (): void => {
    if (container.value) {
        const rect = container.value.getBoundingClientRect();
        canvasWidth.value = rect.width;
        // Физический размер canvas умножаем на devicePixelRatio, чтобы изображение было чётким
        if (canvas.value) {
            canvas.value.width = canvasWidth.value * devicePixelRatio;
            canvas.value.height = canvasHeight.value * devicePixelRatio;
        }
    }
};

// Масштабирование контекста
const scaleContext = (ctx: CanvasRenderingContext2D): void => {
    ctx.setTransform(1, 0, 0, 1, 0, 0); // сброс трансформации
    ctx.scale(devicePixelRatio, devicePixelRatio);
};

// Отрисовка
const draw = (): void => {
    const ctx = canvas.value?.getContext('2d');
    if (!ctx || canvasWidth.value === 0) return;

    // Устанавливаем правильное масштабирование
    scaleContext(ctx);

    const w = canvasWidth.value;
    const h = canvasHeight.value;
    const baseYPos = baseY.value;
    const amp = props.amplitude;
    const freq = (Math.PI * 2 * props.waveCount) / w;
    const currentPhase = phase.value;

    ctx.clearRect(0, 0, w, h);

    // ---- 1. Активная волна (цветная) только слева от thumb ----
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, thumbX.value, h);
    ctx.clip();

    ctx.beginPath();
    ctx.strokeStyle = props.color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let x = 0; x <= w; x += 2) {
        const y = baseYPos + amp * Math.sin(x * freq + currentPhase);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // ---- 2. Неактивная прямая линия (серая) только справа от thumb ----
    ctx.save();
    ctx.beginPath();
    ctx.rect(thumbX.value, 0, w - thumbX.value, h);
    ctx.clip();

    ctx.beginPath();
    ctx.strokeStyle = props.inactiveColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.moveTo(thumbX.value, baseYPos);
    ctx.lineTo(w, baseYPos);
    ctx.stroke();
    ctx.restore();

    // ---- 3. Вертикальный плоский thumb (в виде прямоугольника) ----
    const thumbWidth = 4;
    const thumbXPos = thumbX.value - thumbWidth / 2;

    // Убираем тень, которая давала свечение
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Заливка thumb
    ctx.fillStyle = props.color;
    ctx.beginPath();
    const radius = 2;
    ctx.moveTo(thumbXPos + radius, 0);
    ctx.lineTo(thumbXPos + thumbWidth - radius, 0);
    ctx.quadraticCurveTo(thumbXPos + thumbWidth, 0, thumbXPos + thumbWidth, radius);
    ctx.lineTo(thumbXPos + thumbWidth, h - radius);
    ctx.quadraticCurveTo(thumbXPos + thumbWidth, h, thumbXPos + thumbWidth - radius, h);
    ctx.lineTo(thumbXPos + radius, h);
    ctx.quadraticCurveTo(thumbXPos, h, thumbXPos, h - radius);
    ctx.lineTo(thumbXPos, radius);
    ctx.quadraticCurveTo(thumbXPos, 0, thumbXPos + radius, 0);
    ctx.closePath();
    ctx.fill();

    // Обводка thumb толщиной 1px (отделяет от линий)
    ctx.strokeStyle = props.thumbBorderColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Сброс теней (хотя уже сбросили)
    ctx.shadowColor = 'transparent';
};

// Управление анимацией
const startAnimation = (): void => {
    if (isAnimating.value || props.pauseAnimation) return;
    isAnimating.value = true;
    const animate = (): void => {
        if (!props.pauseAnimation) {
            phase.value += 0.02;
        }
        draw();
        if (isAnimating.value) {
            animationFrame.value = requestAnimationFrame(animate);
        }
    };
    animate();
};

const stopAnimation = (): void => {
    if (animationFrame.value !== null) {
        cancelAnimationFrame(animationFrame.value);
        animationFrame.value = null;
    }
    isAnimating.value = false;
};

// Следим за пропсом pauseAnimation
watch(() => props.pauseAnimation, (newVal) => {
    if (newVal) {
        stopAnimation();
    } else {
        startAnimation();
    }
});

// Drag handlers
const startDrag = (e: MouseEvent | TouchEvent): void => {
    e.preventDefault();
    isDragging.value = true;
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', onDrag, { passive: false });
    window.addEventListener('touchend', stopDrag);
    setValueFromEvent(e);
};

const onDrag = (e: MouseEvent | TouchEvent): void => {
    e.preventDefault();
    setValueFromEvent(e);
};

const stopDrag = (): void => {
    isDragging.value = false;
    removeDragListeners();
    // Генерируем событие change после окончания перетаскивания
    emit('change', props.modelValue);
};

const removeDragListeners = (): void => {
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', stopDrag);
    window.removeEventListener('touchmove', onDrag);
    window.removeEventListener('touchend', stopDrag);
}

const setValueFromEvent = (e: MouseEvent | TouchEvent): void => {
    if (!container.value) return;
    const rect = container.value.getBoundingClientRect();
    let clientX: number;
    if ('touches' in e) {
        clientX = (e.touches[0] as Touch).clientX;
    } else {
        clientX = e.clientX;
    }
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(rect.width, x));
    const newPercent = x / rect.width;
    let rawValue = props.min + newPercent * (props.max - props.min);
    if (props.step > 0) {
        const steps = Math.round((rawValue - props.min) / props.step);
        rawValue = props.min + steps * props.step;
    }
    rawValue = Math.min(props.max, Math.max(props.min, rawValue));
    emit('update:modelValue', rawValue);
};

// Обработчики нативного input
const onNativeInput = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    emit('update:modelValue', parseFloat(target.value));
};

const onNativeChange = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    emit('change', parseFloat(target.value));
};

// Синхронизация с modelValue
watch(() => props.modelValue, (newVal: number) => {
    if (input.value) {
        input.value.value = String(newVal);
    }
    draw();
});

// ResizeObserver
const resizeObserver = new ResizeObserver(() => {
    updateCanvasSize();
    nextTick(() => draw());
});

onMounted(() => {
    updateCanvasSize();
    if (container.value) {
        resizeObserver.observe(container.value);
    }
    if (!props.pauseAnimation) {
        startAnimation();
    }
});

onUnmounted(() => {
    stopAnimation();
    resizeObserver.disconnect();
    removeDragListeners();
});
</script>

<style scoped>
.material-slider {
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

.slider-canvas {
    display: block;
    width: 100%;
    border: 1px solid transparent;
    height: 100%;
    pointer-events: none;
}

.hidden-input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}
</style>