<script setup lang="ts">
</script>

<template>
    <header>
        <h2>Bolgaro4ka Music</h2>
        <div class="header__links">
            <RouterLink to="/home">Home</RouterLink>
            <RouterLink to="/albums">Albums</RouterLink>
            <RouterLink to="/songs">Songs</RouterLink>
            <RouterLink to="/profile">
                <button class="button-link-outline">Sign in</button>
            </RouterLink>
            <RouterLink to="/profile">
                <button class="button-link">Log in</button>
            </RouterLink>
        </div>
    </header>
</template>

<style lang="scss" scoped>
header {
    display: flex;
    height: 50px;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background-color: var(--surface-color);

    .header__links {
        display: flex;
        gap: 10px;
        align-items: center;
    }


}
</style>