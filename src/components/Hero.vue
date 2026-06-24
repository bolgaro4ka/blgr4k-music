<script setup lang="ts">
</script>

<template>
    <div class="hero">
        <div class="hero__img">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
                <path
                    d="M287-167q-47-47-47-113t47-113q47-47 113-47 23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47q-66 0-113-47Z" />
            </svg>
        </div>
        <div class="hero__content">
            <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Neque quod explicabo quia deleniti! Non earum
                iusto illum, doloribus nulla accusamus laborum totam at error, assumenda incidunt sapiente eveniet et
                fugit? Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi porro laboriosam debitis minima
                consequatur nemo vero laborum suscipit adipisci perferendis, fugiat dignissimos aliquid numquam possimus
                nobis, vitae iusto, nisi provident.</p>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.hero {
    display: flex;
    padding: 20px 20px;
    width: 100%;
    margin: 0 auto;
    max-width: 900px;


    .hero__img {
        width: 30%;
    }

    .hero__content {
        width: 70%;
    }

    .hero__img svg {
        fill: var(--primary-color);
        width: 80%;
        height: 80%;
    }
}
</style>