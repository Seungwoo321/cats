<template>
  <div>
    <div class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            Configuration
          </h1>
          <h2 class="subtitle">
            Node processes managed by pm2
          </h2>
        </div>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="tabs is-centered is-boxed">
          <ul>
            <li class="is-active">
              <a>
                <span class="icon is-small">
                  <i class="fa fa-file-alt"></i>
                </span>
                <span>
                  PM2
                </span>
              </a>
            </li>
            <li>
              <a>
                <span class="icon is-small">
                  <i class="fa fa-database"></i>
                </span>
                <span>
                  COLLECTOR
                </span>
              </a>
            </li>
            <li>
              <a>
                <span class="icon is-small">
                  <i class="fa fa-film"></i>
                </span>
                <span>
                  Optional
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
    <BotCraate></BotCraate>
  </div>
</template>

<script>
import BotCraate from '@/components/bot-configuration/BotCreate'
export default {
  components: {
    BotCraate
  }
}
</script>

<style>

</style>
