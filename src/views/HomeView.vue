<script lang="ts">
import { useBudgetStore } from '@/stores/budget'

const getReg = (v: string) => new RegExp("(?=.*" + v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').split(/\W+/g).join(")(?=.*") + ")", 'i');

export default {
  setup() {
    const store = useBudgetStore();

    return { store };
  },
  data() {
    const store = useBudgetStore();
    const budgets = [];

    for (let i of Object.keys(store.budget.budgets)) {
      budgets.unshift({
        id: i,
        ...store.budget.budgets[i]
      });
    }
    return {
      query: this.$route.query.query || '',
      regexp: getReg(this.$route.query.query as string || ''),
      newLimit: store.budget.global.limit,
      budgets: budgets
    };
  },
  methods: {
    limitSubmit(e: Event) {
      this.store.updateLimit(this.newLimit);
    },
    confirmReset() {
      if (confirm('Do you really want to reset all expenses?')) {
        this.store.resetExpenses();
        this.budgets.forEach((i) => {
          i.spent = 0;
          i.percent = 0;
        });
      }
    }
  },
  watch: {
    '$route.query.query': function (value) {
      this.query = value;
    },
    query(value) {
      this.regexp = getReg(value);
    },
  }
}
</script>

<template>
  <div class="container-sm d-flex flex-column mb-4 p-3 rounded gap-4"
    :class="{ 'bg-opacity-10': store.budget.global.percent > 100, 'bg-danger': store.budget.global.percent > 100, 'bg-light': store.budget.global.percent <= 100 }">

    <!-- Overall expenses -->
    <div class="d-flex align-items-center justify-content-between" style="width: 100%">
      <h4>Overall expenses</h4>
      <label class="d-flex flex-row flex-nowrap align-items-end fw-semibold fs-5">
        {{ store.budget.global.spent.toFixed(2) }}
        <small class="text-muted ms-1 fw-normal"> / {{ store.budget.global.limit }} €</small>
      </label>
    </div>
    <div class="progress" role="progressbar" aria-label="Progress" aria-valuenow="25" aria-valuemin="0"
      aria-valuemax="100" style="height: 12px;">
      <div class="progress-bar"
        :class="{ 'bg-warning': store.budget.global.percent >= 60, 'bg-danger': store.budget.global.percent > 100 }"
        :style="`width: ${store.budget.global.percent}%`"></div>
    </div>

    <!-- Overall limits -->
    <div class="d-flex align-items-center justify-content-between" style="width: 100%">
      <h4>Overall limits</h4>
      <label class="d-flex flex-row flex-nowrap align-items-end fw-semibold fs-5">
        {{ store.budget.global.currentLimit.toFixed(2) }}
        <small class="text-muted ms-1 fw-normal"> / {{ store.budget.global.limit }} €</small>
      </label>
    </div>
    <div class="progress" role="progressbar" aria-label="Progress" aria-valuenow="25" aria-valuemin="0"
      aria-valuemax="100" style="height: 12px;">
      <div class="progress-bar"
        :class="{ 'bg-warning': store.budget.global.currentLimitPercent >= 60, 'bg-danger': store.budget.global.currentLimitPercent > 100 }"
        :style="`width: ${store.budget.global.currentLimitPercent}%`"></div>
    </div>

    <!-- form -->
    <div class="d-flex flex-column flex-md-row gap-2" style="width: 100%;">
      <form @submit.prevent="limitSubmit" class="d-flex flex-row justify-content-center input-group"
        style="width: auto; flex: 1 1 0%;">
        <span class="input-group-text">Limit</span>
        <input v-model="newLimit" class="form-control" id="global-limit" placeholder="Expenses limit" type="number"
          min="0" step="1" />
        <span class="input-group-text">€</span>
        <button type="submit" class="btn btn-dark">Update limit</button>
      </form>
      <button @click="confirmReset" class="btn btn-outline-danger">Reset expenses</button>
      <button @click="$router.push('/expenses')" class="btn btn-primary">Browse expenses</button>
    </div>
  </div>

  <!-- Budgets list -->
  <main class="budgets gap-3 pb-3">
    <div v-for="item in budgets" class="card col"
      :class="{ 'bg-opacity-10': item.percent > 100, 'bg-danger': item.percent > 100 }"
      :data-display="regexp.test(item.title)">
      <div class="card-body d-flex flex-column gap-3">
        <div class="d-flex justify-content-between gap-3 align-items-center">
          <label class="h5 text-truncate" style="width: 0; flex: 1 1 0%;">{{ item.title }}</label>
          <label class="d-flex flex-row flex-nowrap align-items-end fw-semibold">
            {{ item.spent.toFixed(2) }}
            <small class="text-muted ms-1 fw-normal"> / {{ item.limit }} €</small>
          </label>
        </div>
        <div class="progress" role="progressbar" aria-label="Progress" aria-valuenow="25" aria-valuemin="0"
          aria-valuemax="100" style="height: 12px;">
          <div class="progress-bar" :class="{ 'bg-warning': item.percent >= 60, 'bg-danger': item.percent > 100 }"
            :style="`width: ${item.percent}%`"></div>
        </div>
        <div class="d-flex">
          <RouterLink :to="`/${item.id}`" class="btn"
            :class="{ 'btn-light': item.percent <= 100, 'btn-danger': item.percent > 100 }" style="width: 100%">View
            budget
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>

<style>
.budgets {
  display: grid;
}

@media (min-width: 576px) {
  .budgets {
    grid-template-columns: auto;
  }
}

@media (min-width: 768px) {
  .budgets {
    grid-template-columns: auto auto;
  }
}

@media (min-width: 992px) {
  .budgets {
    grid-template-columns: auto auto auto;
  }
}

@media (min-width: 1200px) {
  .budgets {
    grid-template-columns: auto auto auto auto;
  }
}

.budgets>[data-display=false] {
  display: none !important;
}
</style>