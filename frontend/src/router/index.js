import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import ProfileView from "../views/profileView.vue";

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
    {   path: '/profile',
        component: ProfileView,
        meta: { requiresAuth: true } },
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