<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <img alt="Murr logo" class="logo" src="@/assets/M.png" />
    <h1>urr Chooser</h1>
    <h1 class="big-screen">Murr Chooser</h1>

    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 10vh;
  display: flex;
}

header h1 {
  margin-block: auto;
  font-size: 1.75rem;
  transform: translate(-.4rem, .1rem);
}

.logo {
  display: block;
  padding: 10px;
  /* width: 64px; */
  max-height: inherit;
}

.wrapper {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.big-screen {
  display: none;
}

nav {
  width: 100%;
  font-size: 1rem;
  text-align: center;
  margin-top: 5px;
}

nav a.router-link-exact-active {
  color: var(--color-primary);
}

nav a:hover {
  color: var(--color-primary-dark-2);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
  color: var(--color-primary);
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
  color: var(--color-text); /* Setze die Standardfarbe der Links auf grau */
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1100px) {
  header {
    max-width: 40vw;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
    margin-block: auto;
    padding-block: 35%;
  }

  header h1 {
    display: none;
  }

  .logo {
    --size: 20vw;
    aspect-ratio: 1/1 !important;
    width: var(--size);
    min-height: var(--size);
  }

  header .wrapper {
    width: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    margin: 0;
  }

  .big-screen {
    display: block;
    font-size: 3rem;
    margin-bottom: 16px;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1.25rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
