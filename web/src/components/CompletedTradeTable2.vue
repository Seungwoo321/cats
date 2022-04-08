<template>
  <div class="table-container" style="max-height:511px;overflow:auto;">
    <table class="table is-narrow is-striped is-fullwidth">
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <td style="text-transform:capitalize;">
            <p class="is-flex is-justify-content-space-between">
                <span :class="`tag ${item.direction === 'long' ? 'is-success' : 'is-danger'}`">
                {{ item.direction }}
                </span>
                <span>
                  <small v-if="item.exitTime" :class="item.profitPct < 0 ? 'has-text-danger' : 'has-text-success'">
                    ({{ item.profitPct ? item.profitPct.toFixed(3) : item.profitPct }} %)
                  </small>
                  {{ item.qty }}
                </span>
            </p>
            <p class="is-flex is-justify-content-space-between">
                <small>
                  {{ item.entryTime.substring(0, 10) }} {{ item.entryTime.substring(11, 19) }} >
                </small>
                <small>
                  {{ item.entryPrice }}
                </small>
            </p>
            <p v-if="item.exitTime" class="is-flex is-justify-content-space-between">
                <small>
                  {{ item.exitTime ? item.exitTime.substring(0, 10) + ' ' + item.exitTime.substring(11, 19): undefined }} >
                </small>
                <small>
                  {{ item.exitPrice }}
                </small>
            </p>
          <!-- <small>
            {{ item.exitReason }}
          </small> -->
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: function () {
        return []
      }
    }
  }
}
</script>

<style>

</style>
