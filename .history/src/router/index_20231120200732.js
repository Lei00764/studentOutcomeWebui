import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: ()=>import("@/pages/LoginPage.vue"),
            children:[
                {
                    path: "",
                    name: "loginView",
                    component: ()=>import("@/views/LoginView.vue"),
                },

            ]
        },
        {
            path: '/',
            name: 'home',
            component: ()=>import("@/pages/HomePage.vue"),
            children:[
                {
                    path: "",
                    name: "homeView",
                    component: ()=>import("@/views/HomeView.vue"),
                },
                {
                    path: "user",
                    name: "userView",
                    component: ()=>import("@/views/UserView.vue"),
                },
                {
                    path: "competition",
                    name: "competitionSeries",
                    children: [
                        {
                            path: "",
                            name: "competitionHomeView",
                            component: ()=>import("@/views/CompetitionView.vue"),
                        },
                        {
                            path: "edit/:teamId",
                            name: "teamEdit",
                            component: () => import("@/views/CompetitionEditView.vue")
                        },
                        {
                            path: "new",
                            name: "teamNew",
                            component: () => import("@/views/CompetitionEditView.vue")
                        },
                        {
                            path: "view/:teamId",
                            name: "teamView",
                            component: () => import("@/views/CompetitionViewView.vue")
                        }

                    ]
                },
                {
                    path: "volunteers",
                    name: "volunteersview",
                    component: ()=>import("@/views/VolunteersView.vue"),
                },
                {
                    path: "socialWork",
                    name: "socialWork",
                    component: ()=>import("@/views/socialWork.vue"),
                },
                {
                    path: "test2",
                    name: "testview2",
                    component: ()=>import("@/views/TestView2.vue"),
                },
            ]
        },
        { path: '/:pathMatch(.*)*', name: 'NotFound', component: ()=>import("@/pages/ErrorPage.vue") },
    ]
})

export default router
