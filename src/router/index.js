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
                    component: ()=>import("@/views/miscellany/LoginView.vue"),
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
                    component: ()=>import("@/views/miscellany/HomeView.vue"),
                },
                {
                    path: "user",
                    name: "userView",
                    component: ()=>import("@/views/miscellany/UserView.vue"),
                },
                {
                    path: "competition",
                    name: "competitionSeries",
                    children: [
                        {
                            path: "",
                            name: "competitionHomeView",
                            component: ()=>import("@/views/competition/CompetitionView.vue"),
                        },
                        {
                            path: "edit/:teamId",
                            name: "teamEdit",
                            component: () => import("@/views/competition/CompetitionEditView.vue")
                        },
                        {
                            path: "new",
                            name: "teamNew",
                            component: () => import("@/views/competition/CompetitionEditView.vue")
                        },
                        {
                            path: "view/:teamId",
                            name: "teamView",
                            component: () => import("@/views/competition/CompetitionViewView.vue")
                        }

                    ]
                },
                {
                    path: "competitionCheck",
                    name: "competitionCheckSeries",
                    children: [
                        {
                            path: "",
                            name: "competitionCheckHomeView",
                            component: ()=>import("@/views/competition/CompetitionCheckListView.vue"),
                        },
                        {
                            path: ":teamId",
                            name: "teamCheck",
                            component: () => import("@/views/competition/CompetitionCheckView.vue")
                        },

                    ]
                },
                {
                    path: "paper",
                    name: "papersView",
                    component: ()=>import("@/views/paper/PaperView.vue"),
                },
                {
                    path: "patent",
                    name: "patentsView",
                    component: ()=>import("@/views/patent/PatentView.vue"),
                },
                {
                    path: "socialWork",
                    name: "socialWork",
                    component: ()=>import("@/views/social/socialWork.vue"),
                },
                {
                    path: "changeVolunteers",
                    name: "changeVolunteers",
                    component: ()=>import("@/views/volunteer/changeVolunteers.vue"),
                },
            ]
        },

        { path: '/:pathMatch(.*)*', name: 'NotFound', component: ()=>import("@/pages/ErrorPage.vue") },
    ]
})

export default router
