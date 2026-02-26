import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';

const routes = [
    {
        path: '/login',
        component: LoginView,
    },
    {
        path: '/',
        component: HomeView,
        meta: { requiresAuth: true }, // route protégée
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Route guard : redirige vers /login si pas connecté
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    if (to.meta.requiresAuth && !token) {
        next('/login');
    } else {
        next();
    }
});

export default router;