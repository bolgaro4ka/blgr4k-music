<script setup lang="ts">
import { getAudioMetadata, type AudioMetadata } from '@/functions/meta/main';
import { ref, type Ref } from 'vue';
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import PlayButton from './PlayButton.vue';
import { DB } from '@/db/main.ts';



const props = defineProps({
    id: {
        type: Number,
        required: true
    }
})

const sData: Ref<AudioMetadata | undefined> = ref()

onMounted(async () => {
    sData.value = await getAudioMetadata(globalThis.location.origin + DB.songs[props.id]?.path)
})

</script>

<template>
    <div>
        <RouterLink :to="DB.songs[props.id]?.page ?? DB.songs[0]?.page as string">
            <div class="song">
                <img :src="sData?.cover as string" alt="song" />
                <div class="song__content">
                    <h4>{{ sData?.title }}</h4>
                </div>
            </div>
        </RouterLink>
        <div class="song">
            <div class="song__content">
                <div class="song__play">
                    <div>
                        <p>{{ sData?.genre }}</p>
                        <p>{{ sData?.duration }}</p>
                    </div>
                    <PlayButton :id="props.id" />
                </div>
            </div>
        </div>

    </div>
</template>

<style lang="scss" scoped>
.song {
    background-color: var(--surface-color);
    display: flex;
    flex-direction: column;
    width: 200px;
    border-radius: 10px;

    h4 {
        font-size: 24px;
    }

    img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 10px;
    }

    .song__content {
        padding: 10px;
    }

    .song__play {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

}
</style>