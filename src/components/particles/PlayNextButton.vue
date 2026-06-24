<script setup lang="ts">
import { useMusicStore } from '@/stores/main';


const musicPlayer = useMusicStore();

</script>

<template>
    <button class="btn btn--next" @click="musicPlayer.handleNext">
        <svg class="btn__bg btn__bg--noanim" style="transform: rotate(90deg);" xmlns="http://www.w3.org/2000/svg"
            width="380" height="380" viewBox="0 0 380 380" fill="var(--secondary-color)">
            <path
                d="M262.422 104.907C253.213 90.2936 243.84 75.4777 231.389 63.8739C218.938 52.2412 202.808 44.023 186.27 45.0937C171.748 46.0486 158.288 54.0932 147.662 64.5974C137.036 75.1015 128.781 88.0365 120.661 100.856C98.7011 135.464 76.7136 170.073 54.7533 204.711C44.3181 221.147 33.6105 238.307 30.7224 257.898C27.2349 281.568 36.6348 305.673 53.3093 321.415C70.7467 337.88 99.0008 336.549 120.225 332.035C143.493 327.086 166.244 317.769 189.975 317.797C210.301 317.797 229.945 324.685 249.726 329.691C269.479 334.668 290.704 337.735 309.776 330.327C333.453 321.154 350.454 295.082 349.991 268.315C349.555 243.892 323.508 201.759 323.508 201.759C323.508 201.759 282.78 137.194 262.422 104.907Z"
                fill="var(--secondary-color)" />
        </svg>
        <span class="btn__icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                fill="var(--background-color)">
                <path d="M660-240v-480h80v480h-80Zm-440 0v-480l360 240-360 240Zm80-240Zm0 90 136-90-136-90v180Z" />
            </svg>
        </span>
    </button>
</template>

<style lang="scss" scoped>
.btn--previous,
.btn--next {
    background-color: #333;
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 10000px;
    display: flex;
    align-items: center;
    justify-content: center;
}



.btn {
    position: relative;
    width: 60px;
    height: 60px;
    border: none;
    background: none;
    padding: 0;
}

.btn--primary {
    width: 120px !important;
    height: 120px !important;
}

.btn__bg {
    position: absolute;
    inset: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    fill: var(--triary-color);
    animation: rotate 4s linear infinite;
}

.btn__bg--noanim {
    animation: none;
}

.btn__bg-stop {
    animation: rotate 0.2s linear 1;
    transform: scale(0.95);
}

.btn-res {
    position: absolute;
    inset: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    fill: var(--triary-color);
    animation: fill-resize 0.1s linear 1;
}

.btn__icon {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}
</style>