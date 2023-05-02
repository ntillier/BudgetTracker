<script lang="ts">
import { useBudgetStore } from '@/stores/budget';
import dateFormat from 'dateformat';

export default {
    setup() {
        const store = useBudgetStore();

        return { store };
    },
    data() {
        const budgetId: string = this.$route.params.budget as string;
        const store = useBudgetStore();

        return {
            budgetId,
            budget: store.budget.budgets[budgetId],
            expenses: store.budget.budgets[budgetId].expenses.map((i) => ({ id: i, ...store.budget.expenses[i] })).reverse(),
            showDrawer: false,
            newLimit: store.budget.budgets[budgetId].limit,
            newExpense: {
                name: '',
                amount: 0,
                warn: false
            }
        };
    },
    methods: {
        formatDate(epoch: number) {
            return dateFormat(new Date(epoch), 'dddd, mmmm d, yyyy H:M');
        },
        toogleDrawer() {
            this.showDrawer = !this.showDrawer;
        },
        addExpense() {
            const result = this.store.createExpense(this.budgetId, this.newExpense.name, this.newExpense.amount);
            if (result) {
                this.newExpense.warn = false;
                this.newExpense.name = '';
                this.newExpense.amount = 0;
                this.expenses.unshift({
                    id: result.id,
                    ...result.expense
                });
                this.showDrawer = false;
            }
        },
        changeLimit() {
            this.store.changeLimit(this.budgetId, this.newLimit);
        },
        removeExpense(id: string) {
            const deleted = this.store.removeExpense(this.budgetId, id);
            if (deleted) {
                this.expenses = this.expenses.filter((i: any) => {
                    return i.id !== id;
                });
                this.budget = this.store.budget.budgets[this.budgetId];
            }
        },
        removeBudget() {
            if (confirm('Do you really want to remove this budget?') && this.store.removeBudget(this.budgetId)) {
                this.$router.push('/');
            }
        },
        resetBudgetExpenses () {
            if (confirm('Do you really want to reset the expenses of this budget?')) {
                this.store.resetBudgetExpenses(this.budgetId);
                this.expenses = [];
            }
        }
    },
    watch: {
        'newExpense.amount': function (value: number) {
            if (value + this.budget.spent > this.budget.limit) {
                this.newExpense.warn = true;
            } else {
                this.newExpense.warn = false;
            }
        }
    }
};
</script>

<template>
    <button @click="$router.push('/')" class="btn btn-light mb-4 d-flex flex-row gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
            style="width: 24px; height: 24px;">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
        </svg>

        Back to budgets
    </button>

    <!-- Budget heading -->
    <div v-if="budget" class="container-sm d-flex flex-column mb-4 p-3 rounded gap-4"
        :class="{ 'bg-opacity-10': budget.percent >= 100, 'bg-danger': budget.percent > 100, 'bg-light': budget.percent < 100 }">


        <div class="d-flex align-items-center justify-content-between" style="width: 100%">
            <h3>{{ budget.title }}</h3>
            <label class="d-flex flex-row flex-nowrap align-items-end fw-semibold fs-4">
                {{ budget.spent.toFixed(2) }}
                <small class="text-muted ms-1 fw-normal"> / {{ budget.limit }} €</small>
            </label>
        </div>
        <div class="progress" role="progressbar" aria-label="Progress" aria-valuenow="25" aria-valuemin="0"
            aria-valuemax="100" style="height: 12px;">
            <div class="progress-bar" :class="{ 'bg-warning': budget.percent >= 60, 'bg-danger': budget.percent > 100 }"
                :style="`width: ${budget.percent}%`"></div>
        </div>

        <!--  Budget progress bar -->
        <div class="d-flex flex-column flex-md-row gap-2" style="width: 100%;">
            <form @submit.prevent="changeLimit" class="d-flex flex-row justify-content-center input-group"
                style="width: auto; flex: 1 1 0%;">
                <span class="input-group-text">Limit</span>
                <input v-model="newLimit" class="form-control" id="global-limit" placeholder="Expenses limit" type="number"
                    min="0" step="1" />
                <span class="input-group-text">€</span>
                <button class="btn btn-dark" type="submit">Change</button>
            </form>
            <button class="btn btn-outline-danger" @click="removeBudget">Delete</button>
            <button class="btn btn-outline-danger" @click="resetBudgetExpenses">Reset</button>
            <button class="btn btn-primary" @click="toogleDrawer">Add expense</button>
        </div>
    </div>

    <!-- Expenses -->
    <div class="list-group mb-4">

        <!-- Expense item -->
        <div v-for="expense in expenses"
            class="list-group-item d-flex flex-row justify-content-center align-items-center gap-4">
            <div style="width: 0; flex: 1 1 0;">
                <div class="fw-semibold fs-5 text-truncate">{{ expense.name }}</div>
                <span class="text-muted text-truncate fs-6">{{ formatDate(expense.date) }}</span>
            </div>
            <div class="d-flex flex-row align-items-center gap-4">
                <div class="fw-semibold fs-5">{{ expense.amount.toFixed(2) }} €</div>
                <button @click="removeExpense(expense.id)" type="button"
                    class="btn btn-outline-danger btn-sm d-none d-block-hover">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" style="width: 12px; height: 12px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- overlay -->
    <div class="offcanvas offcanvas-end" :class="{ 'show': showDrawer, 'hiding': !showDrawer }" tabindex="-1"
        data-bs-backdrop="static" aria-labelledby=" offcanvasExampleLabel">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="offcanvasExampleLabel">New expense</h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"
                @click="toogleDrawer"></button>
        </div>
        <div class="offcanvas-body">
            <form @submit.prevent="addExpense" class="d-flex flex-column gap-2">
                <div>
                    <label class="form-label fw-medium" for="title">Name</label>
                    <input v-model="newExpense.name" required type="text" id="title" class="form-control"
                        placeholder="Name" />
                </div>
                <div class="mb-2">
                    <label class="form-label fw-medium" for="spending">Spending</label>
                    <div class="input-group">
                        <input v-model="newExpense.amount" required type="number" id="spending" step="0.01" min="0.01"
                            class="form-control" placeholder="Spending" />
                        <span class="input-group-text">€</span>
                    </div>
                </div>
                <div v-if="newExpense.warn" class="alert alert-danger m-0" role="alert">
                    This expense will make your budget exceed its limit.
                </div>
                <button type="submit" class="btn btn-primary">CREATE</button>
            </form>
        </div>
    </div>
</template>

<style>
.list-group-item:hover .btn {
    display: block !important;
}
</style>