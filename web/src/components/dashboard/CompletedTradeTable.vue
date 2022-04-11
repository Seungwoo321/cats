<template>
  <div class="table-container">
    <table class="table is-narrow is-striped is-fullwidth">
      <thead>
        <tr>
          <th>
            Direction
          </th>
          <th>
            Entry Time
          </th>
          <th>
            Entry Price
          </th>
          <th>
            Exit Time
          </th>
          <th>
            Exit Price
          </th>
          <th>
            Qty
          </th>
          <th>
            Profit Percent
          </th>
          <th>
            Exit Reason
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <td style="text-transform:capitalize;">
            <span :class="`tag ${item.direction === 'long' ? 'is-success' : 'is-danger'}`">
              {{ item.direction }}
            </span>
          </td>
          <td>
            {{ item.entryTime.substring(0, 10) }} {{ item.entryTime.substring(11, 19) }}
          </td>
          <td>
            {{ item.entryPrice }}
          </td>
          <td>
            {{ item.exitTime ? item.exitTime.substring(0, 10) + ' ' + item.exitTime.substring(11, 19): undefined }}
          </td>
          <td>
            {{ item.exitPrice }}
          </td>
          <td>
            {{ item.qty }}
          </td>
          <td :class="item.profitPct < 0 ? 'has-text-danger' : 'has-text-success'">
            {{ item.profitPct ? item.profitPct.toFixed(3) : item.profitPct }}
          </td>
          <td>
            {{ item.exitReason }}
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
