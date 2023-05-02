import { ref, computed } from 'vue';
import { customAlphabet } from 'nanoid';
import { defineStore } from 'pinia';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 10);

type Expense = {
  name: string;
  amount: number;
  date: number;
};

type ExpensesMap = {
  [key: string]: Expense;
};

type BudgetsMap = {
  [key: string]: Budget;
};

type GlobalBudget = {
  spent: number;
  limit: number;
  percent: number;
  currentLimit: number;
  currentLimitPercent: number;
};

type Budget = {
  title: string;
  spent: number;
  limit: number;
  percent: number;
  created_at: number;
  expenses: string[];
};

type BudgetStore = {
  global: GlobalBudget;
  budgets: BudgetsMap;
  expenses: ExpensesMap;
  loading: boolean;
};

function parseStore(key: string, value: any) {
  try {
    return JSON.parse(window.localStorage.getItem(key) || '');
  } catch (_) {
    return value;
  }
}

export const useBudgetStore = defineStore('counter', () => {
  const budget = ref<BudgetStore>({ loading: true, budgets: {}, expenses: {}, global: { spent: 0, limit: 0, percent: 0, currentLimit: 0, currentLimitPercent: 0 } });

  function saveToStore(key: string, value: any) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function saveStore() {
    saveToStore('global', budget.value.global);
    saveToStore('budgets', budget.value.budgets);
    saveToStore('expenses', budget.value.expenses);
  }

  function initAll() {
    const global: GlobalBudget = parseStore('global', {
      spent: 0,
      limit: 0,
      percent: 0,
      currentLimit: 0,
      currentLimitPercent: 0
    });
    const budgets: BudgetsMap = parseStore('budgets', {});
    const expenses: ExpensesMap = parseStore('expenses', {});

    budget.value.global = global;
    budget.value.budgets = budgets;
    budget.value.expenses = expenses;

    saveStore();

    budget.value.loading = false;
  }

  function initStore() {
    /*window.addEventListener('storage', () => {
      console.log('changed')
      initAll(true);
    });*/

    initAll();
  }

  function createBudget(title: string, limit: number) {
    if (budget.value.loading) return;

    let id = '';

    while (!id && !budget.value.budgets[id]) {
      id = nanoid();
    }

    budget.value.budgets[id] = {
      title, limit,
      spent: 0,
      percent: 0,
      created_at: Date.now(),
      expenses: []
    };

    budget.value.global.currentLimit += limit;

    updateGlobalPercent();
    saveStore();

    return id;
  }

  function createExpense(budgetId: string, name: string, amount: number) {
    if (budget.value.budgets[budgetId] && name && amount) {
      let id = '';

      while (!id && !budget.value.expenses[id]) {
        id = nanoid();
      }

      budget.value.expenses[id] = {
        name, amount,
        date: Date.now()
      };

      budget.value.budgets[budgetId].expenses.push(id);
      budget.value.budgets[budgetId].spent += amount;
      budget.value.budgets[budgetId].percent = getBudgetPercent(budgetId);
      budget.value.global.spent += amount;

      updateGlobalPercent();

      saveStore();

      return {
        id,
        expense: budget.value.expenses[id]
      };
    }
    return false;
  }

  function removeExpense(budgetId: string, expenseId: string): boolean {
    if (budget.value.budgets[budgetId] && budget.value.expenses[expenseId] && budget.value.budgets[budgetId].expenses.includes(expenseId)) {
      budget.value.global.spent -= budget.value.expenses[expenseId].amount;
      budget.value.budgets[budgetId].spent -= budget.value.expenses[expenseId].amount;
      budget.value.budgets[budgetId].percent = getBudgetPercent(budgetId);
      updateGlobalPercent();

      delete budget.value.expenses[expenseId];
      budget.value.budgets[budgetId].expenses = budget.value.budgets[budgetId].expenses.filter((i) => i !== expenseId);

      saveStore();

      return true;
    }

    return false;
  }

  function removeBudget(budgetId: string): boolean {
    if (budget.value.budgets[budgetId]) {
      budget.value.budgets[budgetId].expenses.forEach((i) => {
        delete budget.value.expenses[i];
      });
      budget.value.global.spent -= budget.value.budgets[budgetId].spent;
      budget.value.global.currentLimit -= budget.value.budgets[budgetId].limit;
      delete budget.value.budgets[budgetId];

      updateGlobalPercent();
      saveStore();

      return true;
    }
    return false;
  }

  function getBudgetPercent(budgetId: string) {
    return Math.ceil(budget.value.budgets[budgetId].spent / budget.value.budgets[budgetId].limit * 100);
  }

  function changeLimit(budgetId: string, newLimit: number) {
    if (budget.value.budgets[budgetId]) {
      budget.value.global.currentLimit += newLimit - budget.value.budgets[budgetId].limit;
      budget.value.budgets[budgetId].limit = newLimit;
      budget.value.budgets[budgetId].percent = getBudgetPercent(budgetId);
      updateGlobalPercent();
      saveToStore('budgets', budget.value.budgets);
    }
  }

  function updateGlobalPercent() {
    budget.value.global.percent = Math.ceil(budget.value.global.spent / budget.value.global.limit * 100);
    budget.value.global.currentLimitPercent = Math.ceil(budget.value.global.currentLimit / budget.value.global.limit * 100);
    saveToStore('global', budget.value.global);
  }

  function updateLimit(l: number) {
    if (!l || typeof l !== 'number') return;
    budget.value.global.limit = l;
    updateGlobalPercent();
  }

  function resetExpenses () {
    for (var i in budget.value.budgets) {
      budget.value.budgets[i].expenses = [];
      budget.value.budgets[i].spent = 0;
      budget.value.budgets[i].percent = 0;
    }
    budget.value.expenses = {};
    budget.value.global.spent = 0;
    budget.value.global.percent = 0;

    saveStore();
  }

  function resetBudgetExpenses (budgetId: string) {
    if (budget.value.budgets[budgetId]) {
      budget.value.budgets[budgetId].expenses.forEach((i) => {
        delete budget.value.expenses[i];
      });
      budget.value.budgets[budgetId].expenses = [];
      budget.value.global.spent -= budget.value.budgets[budgetId].spent;
      budget.value.budgets[budgetId].spent = 0;
      budget.value.budgets[budgetId].percent = getBudgetPercent(budgetId);

      updateGlobalPercent();
      saveStore();
    }
  }

  return { budget, createBudget, createExpense, initStore, updateLimit, changeLimit, removeExpense, removeBudget, resetExpenses, resetBudgetExpenses };
})
