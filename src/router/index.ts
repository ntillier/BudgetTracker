import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BudgetView from '../views/BudgetView.vue';
import ExpensesView from '../views/ExpensesView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: ExpensesView
    },
    {
      path: '/:budget',
      name: 'budget',
      component: BudgetView
    }
  ]
})

export default router
