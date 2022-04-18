<template>
  <div class="container">
    <div class="columns is-centered">
      <div class="column is-8">

        <!-- Setting -->
        <section class="section pt-0">
          <!-- field: exchnage -->
          <div class="field">
            <p class="control">
              <label class="label">
                Select exchange
              </label>
              <span class="select is-fullwidth">
                <select name="exchange">
                  <option value="bitmex">Bitmex</option>
                  <option value="upbit" disabled>Upbit</option>
                  <option value="binance" disabled>Binance</option>
                </select>
              </span>
            </p>
          </div>
          <!-- field: symbol -->
          <div class="field">
            <label class="label">
              Select symbol
            </label>
            <p class="control">
              <span class="select is-fullwidth">
                <select name="symbol">
                  <option value="BCH/USD:BTC">BTC/USD:BTC</option>
                  <option value="BCH/USD:BTC">ETH/USD:BTC</option>
                  <option value="BCH/USD:BTC">BCH/USD:BTC</option>
                  <option value="BCH/USD:BTC">LTC/USD:BTC</option>
                </select>
              </span>
            </p>
          </div>
          <!-- field: -->
          <div class="field">
            <label class="label">
              Exchange API Key
            </label>
            <p class="control">
              <input class="input" type="text"/>
            </p>
          </div>
          <!-- field: -->
          <div class="field">
            <label class="label">
              Exchange Secret Key
            </label>
            <p class="control">
              <input class="input" type="password"/>
            </p>
          </div>

          <div class="field">
            <label class="label">
              Environment variable
            </label>
            <p class="control">
              <input id="environment" class="checkbox" type="checkbox"/>
              <label for="environment">
                development
              </label>
            </p>
          </div>

          <!-- button -->
          <div class="field is-grouped is-flex is-justify-content-flex-end">
            <p class="control">
              <button class="button is-link">Cancel</button>
            </p>
            <p class="control">
              <button class="button is-primary">Next</button>
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style>

</style>
