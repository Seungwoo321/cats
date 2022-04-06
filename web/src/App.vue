<template>
  <div id="app">
    <LayoutNavbar></LayoutNavbar>
    <div class="container is-fluid">
      <router-view/>
    </div>
  </div>
</template>
<script>
import LayoutNavbar from '@/components/LayoutNavbar'
export default {
  components: {
    LayoutNavbar
  }
}
</script>
<style lang="scss">
// @import "bulma";

#app {
  height: 100vh;
}

</style>
