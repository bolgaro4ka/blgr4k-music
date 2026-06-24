<script setup lang="ts">
</script>

<template>
    <footer>
        <div class="footer__top">
            <h2>Bolgaro4ka Music</h2>
            <div class="footer__links">
                <RouterLink to="/home">Home</RouterLink>
                <RouterLink to="/albums">Albums</RouterLink>
                <RouterLink to="/songs">Songs</RouterLink>
            </div>
        </div>
        <div>
            <p>Все права защищены. 2026.</p>
        </div>
        <div class="footer__margin"></div>
    </footer>
</template>

<style lang="scss" scoped>
footer {
    width: 100%;
    padding: 0 20px;
    margin-bottom: 60px;
    background-color: var(--surface-color);
}

.footer__margin {
    height: 30px;
}

.footer__top {
    display: flex;
    height: 50px;

    align-items: center;
    justify-content: space-between;


    .footer__links {
        display: flex;
        gap: 20px;
    }
}
</style>