<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import { setTheme } from './functions/colors/main';
import { onMounted } from 'vue';

import MainSongControl from './components/MainSongControl.vue';

onMounted(() => {
    setTheme("dark");
})

</script>

<template>
    <Header />
    <RouterView />
    <Footer />
    <MainSongControl />
</template>

<style scoped></style>
