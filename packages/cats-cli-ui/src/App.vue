<template>
  <div id="app">
    <section>
      <TopBar></TopBar>
    </section>
    <router-view></router-view>
    <section>
      <footer class="footer">
        <div class="container">
          <div class="content has-text-centered">
            <p>
              <a class="icon" href="//github.com/Seungwoo321/cats" target="_blank">
                <i class="fab fa-github"></i>
              </a>
            </p>
            <p>
              Copyright © 2022 cats. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </section>
  </div>
</template>
<script>
import TopBar from '@/components/app/TopBar'
export default {
  components: {
    TopBar
  }
}
</script>
<style lang="scss">

</style>
