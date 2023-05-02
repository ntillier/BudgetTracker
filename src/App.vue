<script lang="ts">
import { useBudgetStore } from '@/stores/budget'
import { RouterLink, RouterView } from 'vue-router'

export default {
  setup() {
    const store = useBudgetStore();
    store.initStore();

    return { store };
  },
  data() {
    return {
      showDrawer: false,
      query: this.$route.query.query,
      newBudget: {
        title: '',
        amount: 0,
        warn: false
      }
    };
  },
  methods: {
    toogleDrawer() {
      this.showDrawer = !this.showDrawer;
    },
    createNewBudget() {
      const id = this.store.createBudget(this.newBudget.title, this.newBudget.amount);
      this.newBudget = {
        title: '',
        amount: 0,
        warn: false
      };
      this.showDrawer = false;
      this.$router.push(`/${id}`);
    }
  },
  watch: {
    'newBudget.amount': function (value: number) {
      if (value + this.store.budget.global.currentLimit > this.store.budget.global.limit) {
        this.newBudget.warn = true;
      } else {
        this.newBudget.warn = false;
      }
    }
  }

}
</script>

<template>
  <div class="container">
    <nav class="navbar bg-body-tertiary">
      <div class="container-fluid p-2">
        <RouterLink class="navbar-brand h1" to="/">
          Budget<span class="fw-bold" style="color: var(--bs-primary);">Tracker</span>
        </RouterLink>
        <div class="d-flex">
          <form @submit.prevent="$router.push(`/?query=${encodeURIComponent(query  as string)}`)" role="search" class="d-flex">
            <input v-model="query" class="form-control me-2 py-2" type="search" placeholder="Search a budget" aria-label="Search">
          </form>
          <button class="btn btn-primary" type="button" @click="toogleDrawer">New Budget</button>
        </div>
      </div>
    </nav>
    <RouterView :key="($route.params.budget as string)" />
  </div>
  <div class="offcanvas offcanvas-end" :class="{ 'show': showDrawer, 'hiding': !showDrawer }" tabindex="-1"
    data-bs-backdrop="static" aria-labelledby=" offcanvasExampleLabel">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="offcanvasExampleLabel">New budget</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"
        @click="toogleDrawer"></button>
    </div>
    <div class="offcanvas-body">
      <form @submit.prevent="createNewBudget" class="d-flex flex-column gap-2">
        <div>
          <label class="form-label fw-medium" for="title">Title</label>
          <input v-model="newBudget.title" required type="text" id="title" class="form-control" placeholder="New books" />
        </div>
        <div class="mb-2">
          <label class="form-label fw-medium" for="spending">Spending</label>
          <div class="input-group">
            <input v-model="newBudget.amount" required type="number" id="spending" step="0.01" min="0.01" class="form-control"
              placeholder="Spending" />
            <span class="input-group-text">€</span>
          </div>
        </div>
        <div v-if="newBudget.warn" class="alert alert-danger m-0" role="alert">
          This budget can make your expenses exceed its limit
        </div>
        <button type="submit" class="btn btn-primary">CREATE</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
#app {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
}
/* @import'~bootstrap/dist/css/bootstrap.css'; */
</style>