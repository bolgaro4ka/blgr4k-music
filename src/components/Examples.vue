<script setup lang="ts">
import Song from './particles/Song.vue';




</script>

<template>
    <div class="wrapper">
        <h3>Releases</h3>
        <div class="songs">

            <ul class="songs__list">
                <li>
                    <Song :id="1" />
                </li>
                <li>
                    <Song :id="2" />
                </li>
            </ul>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.wrapper {
    padding: 0 20px;
}

.songs {
    width: 100%;
    justify-content: center;
    align-items: center;
    display: flex;
}

.songs__list {
    display: flex;
    gap: 20px;
    margin-block-start: 0;
    padding-inline-start: 0px;
    list-style: none;
    width: fit-content;

}
</style>