<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-brand">
        <a href="" class="navbar-item">
          <h1 class="title">
            CATS
          </h1>
          <!-- <img src="/img/logo.svg" alt="Logo" srcset=""> -->
        </a>
      </div>
      <div class="navbar-item has-text-grey-light">
        <small>
          Crypto Automated Trading System
        </small>
      </div>
      <div class="navbar-end navbar-menu">
        <a href="" class="navbar-item">Home</a>
        <router-link class="navbar-item" :to="{ name: 'Configuration'}">Configuration</router-link>
        <router-link class="navbar-item" :to="{ name: 'Dashboard' }">Dashboard</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
}
</script>

<style>

</style>
