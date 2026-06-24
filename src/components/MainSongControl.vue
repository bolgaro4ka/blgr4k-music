<script setup lang="ts">
import { ref } from 'vue';
import GRange from './particles/GRange.vue';
import { useMusicStore } from '@/stores/main';
import PlayButton from './particles/PlayButton.vue';
import PlayBackButton from './particles/PlayBackButton.vue';
import PlayNextButton from './particles/PlayNextButton.vue';

const musicPlayer = useMusicStore();



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
                <GRange v-model="musicPlayer.progress" @change="musicPlayer.updateProgress($event)" :pauseAnimation="!musicPlayer.isPlaying"
                    :inactiveColor="musicPlayer.colors.outline" :thumbBorderColor="musicPlayer.colors.background"
                    :color="musicPlayer.colors.secondary" :height="20" :amplitude="4" :wave-count="20" />
            </div>
        </div>

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