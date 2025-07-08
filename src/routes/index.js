import { createRouter, createWebHistory } from 'vue-router';
import RegisterPageComponent from "@/iam/pages/register-page.component.vue";

const PaymentSchedulePage = () => import('@/cuentasclaras/pages/payment-schedule.component.vue');
const DataBonusComponent = () => import('@/cuentasclaras/pages/data-bonus.component.vue');
const DataCostComponent = () => import('@/cuentasclaras/pages/data-expenses.component.vue');
const BonusResultPage = () => import('@/cuentasclaras/pages/bonus-result.vue');
const LoginPage = () => import('@/iam/pages/login-page.component.vue');
const SchedulePage = () => import('@/cuentasclaras/pages/schedule.component.vue');

const router = createRouter({
    history: createWebHistory(),
    routes: [

        {
            path: '/bonus/data',
            name: 'data-bonus',
            component: DataBonusComponent,
            meta: { title: 'Datos del Bono' }
        },
        {
            path: '/bonus/initial-expenses',
            name: 'initial-expenses',
            component: DataCostComponent,
            meta: { title: 'Gastos Iniciales' }
        },
        {
            path: '/bonus/result',
            name: 'bonus-result',
            component: BonusResultPage,
            meta: { title: 'Resultados del Bono' }
        },
        {
            path: '/',
            name: 'login',
            component: LoginPage,
            meta: { title: 'Inicio de Sesión' }
        },
        {
            path: '/bonus/payment-schedule',
            name: 'payment-schedule',
            component: PaymentSchedulePage ,
            meta: { title: 'Cronogramas de pagos' }
        },
        {
            path: '/register',
            name: 'register',
            component: RegisterPageComponent ,
            meta: { title: 'Registro' }
        },
        {
            path: '/schedule',
            name: 'schedule',
            component: SchedulePage ,
            meta: { title: 'Mis Cronogramas' }
        },


    ]
});

router.beforeEach((to, from, next) => {
    const baseTitle = 'CuentasClaras';
    document.title = `${baseTitle} - ${to.meta.title || 'Página'}`;
    next();
});

export default router;
