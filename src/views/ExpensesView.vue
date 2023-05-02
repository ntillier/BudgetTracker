<script setup lang="ts">
import { useBudgetStore } from '@/stores/budget';

const store = useBudgetStore();
</script>

<script lang="ts">
import dateFormat from 'dateformat';

export default {
    data() {
        return {
            query: '',
            regexp: /./
        }
    },
    methods: {
        formatDate(epoch: number) {
            return dateFormat(new Date(epoch), 'dddd, mmmm d, yyyy H:M');
        },
    },
    watch: {
        query(value) {
            this.regexp = new RegExp("(?=.*" + value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').split(/\W+/g).join(")(?=.*") + ")", 'i');
        }
    }
};
</script>

<template>
    <button @click="$router.push('/')" class="btn btn-light d-flex flex-row gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
            style="width: 24px; height: 24px;">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
        </svg>
        Back to budgets
    </button>
    <form class="input-group py-3 px-0" @submit.prevent>
        <input v-model="query" placeholder="Search" class="form-control" style="max-width: 400px;" />
    </form>
    <div class="list-group mb-4 d-flex flex-column-reverse reversed">
        <div
            v-for="expense in store.budget.expenses"
            class="list-group-item d-flex flex-row justify-content-center align-items-center gap-4"
            :data-display="regexp.test(expense.name)"
        >
            <div style="width: 0; flex: 1 1 0;">
                <div class="fw-semibold fs-5 text-truncate">{{ expense.name }}</div>
                <span class="text-muted text-truncate fs-6">{{ formatDate(expense.date) }}</span>
            </div>
            <div class="d-flex flex-row align-items-center gap-4">
                <div class="fw-semibold fs-5">{{ expense.amount }} €</div>
            </div>
        </div>
    </div>
</template>

<style>
.reversed > * {
    border-width: 0 !important;
    border-radius: 0 !important;
}
.reversed > [data-display=false] {
  display: none !important;
}
</style>