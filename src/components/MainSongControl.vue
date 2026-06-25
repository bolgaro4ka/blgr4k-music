<script setup lang="ts">
import { ref } from 'vue';
import GRange from './particles/GRange.vue';
import { useMusicStore } from '@/stores/main';
import PlayButton from './particles/PlayButton.vue';
import PlayBackButton from './particles/PlayBackButton.vue';
import PlayNextButton from './particles/PlayNextButton.vue';
import Modal from './particles/Modal.vue';
import Equalizer from './modals/Equalizer.vue';

const musicPlayer = useMusicStore();
const isEqualizerOpen = ref<boolean>(false)


</script>

<template>
    <div class="song">
        <div class="song__settings">
            <div class="song__volume">
                <div class="song__control">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                        fill="#e3e3e3">
                        <path
                            d="M200-360v-240h160l200-200v640L360-360H200Zm440 40v-322q45 21 72.5 65t27.5 97q0 53-27.5 96T640-320ZM480-606l-86 86H280v80h114l86 86v-252ZM380-480Z" />
                    </svg>
                    <div class="song__speed-range">
                        <GRange v-model="musicPlayer.volume" @change="musicPlayer.updateVolume"
                            :pauseAnimation="!musicPlayer.isPlaying" :inactiveColor="musicPlayer.colors.outline"
                            :thumbBorderColor="musicPlayer.colors.background" :color="musicPlayer.colors.secondary"
                            :height="20" :amplitude="4" :wave-count="2" />
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                        fill="#e3e3e3">
                        <path
                            d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z" />
                    </svg>
                </div>
            </div>
            <div class="song__speed">
                <div class="song__control">
                    <p>0x</p>
                    <div class="song__speed-range">
                        <GRange v-model="musicPlayer.speed" @change="musicPlayer.updateSpeed"
                            :pauseAnimation="!musicPlayer.isPlaying" :inactiveColor="musicPlayer.colors.outline"
                            :thumbBorderColor="musicPlayer.colors.background" :color="musicPlayer.colors.secondary"
                            :height="20" :amplitude="0" :wave-count="2" />
                    </div>
                    <p>2x</p>
                </div>
            </div>

        </div>
        <div class="song__play">
            <PlayBackButton />
            <PlayButton :id="musicPlayer.id" />
            <PlayNextButton />
        </div>
        <div class="song__main">
            <div class="song__content">
                <p>{{ musicPlayer.title }}</p>
                <p>{{ musicPlayer.duration }}</p>
            </div>
            <div class="song__progress">
                <GRange v-model="musicPlayer.progress" @change="musicPlayer.updateProgress($event)"
                    :pauseAnimation="!musicPlayer.isPlaying" :inactiveColor="musicPlayer.colors.outline"
                    :thumbBorderColor="musicPlayer.colors.background" :color="musicPlayer.colors.secondary" :height="20"
                    :amplitude="4" :wave-count="20" />
            </div>
        </div>
        <div class="song__modes">
            <button>


                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000">
                    <path
                        d="M280-120 80-320l200-200 57 56-104 104h607v80H233l104 104-57 56Zm400-320-57-56 104-104H120v-80h607L623-784l57-56 200 200-200 200Z" />
                </svg>
            </button>
            <button>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000">
                    <path
                        d="M280-80 120-240l160-160 56 58-62 62h406v-160h80v240H274l62 62-56 58Zm-80-440v-240h486l-62-62 56-58 160 160-160 160-56-58 62-62H280v160h-80Z" />
                </svg>
            </button>
            <button @click="isEqualizerOpen = !isEqualizerOpen">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000">
                    <path
                        d="M120-40v-168q-35-12-57.5-42.5T40-320v-400h80v-160q0-17 11.5-28.5T160-920q17 0 28.5 11.5T200-880v160h80v400q0 39-22.5 69.5T200-208v168h-80Zm320 0v-168q-35-12-57.5-42.5T360-320v-400h80v-160q0-17 11.5-28.5T480-920q17 0 28.5 11.5T520-880v160h80v400q0 39-22.5 69.5T520-208v168h-80Zm320 0v-168q-35-12-57.5-42.5T680-320v-400h80v-160q0-17 11.5-28.5T800-920q17 0 28.5 11.5T840-880v160h80v400q0 39-22.5 69.5T840-208v168h-80ZM120-640v160h80v-160h-80Zm320 0v160h80v-160h-80Zm320 0v160h80v-160h-80ZM160-280q17 0 28.5-11.5T200-320v-80h-80v80q0 17 11.5 28.5T160-280Zm320 0q17 0 28.5-11.5T520-320v-80h-80v80q0 17 11.5 28.5T480-280Zm320 0q17 0 28.5-11.5T840-320v-80h-80v80q0 17 11.5 28.5T800-280ZM160-440Zm320 0Zm320 0Z" />
                </svg>
            </button>
        </div>
        <Equalizer @close="isEqualizerOpen = !isEqualizerOpen" v-if="isEqualizerOpen" />

    </div>
</template>

<style lang="scss" scoped>
.song {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    align-items: center;
    gap: 20px;
    background-color: var(--surface-color);
    padding: 5px 10px;
    width: 100%;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;

    .song__modes {
        display: flex;
        gap: 10px;

        button {
            background-color: var(--secondary-color);
            border: none;
            width: 50px;
            border-radius: 20px;
            height: 50px;

            svg {
                fill: var(--surface-color)
            }
        }


    }

    .song__content {
        display: flex;
        justify-content: space-between;
    }

    .song__settings {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .song__progress,
    .song__main {
        width: 100%;
    }

    .song__control {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .song__speed-range {
        width: 50px;
    }

    .song__play {
        display: flex;
    }
}
</style>