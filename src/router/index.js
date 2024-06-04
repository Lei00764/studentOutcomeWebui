import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import("@/pages/LoginPage.vue"),
            children: [
                {
                    path: "",
                    name: "loginView",
                    component: () => import("@/views/miscellany/LoginView.vue"),
                },

            ]
        },
        {
            path: '/',
            name: 'home',
            component: () => import("@/pages/HomePage.vue"),
            children: [
                {
                    path: "",
                    name: "homeView",
                    component: () => import("@/views/miscellany/HomeView.vue"),
                },
                {
                    path: "user",
                    name: "userView",
                    component: () => import("@/views/miscellany/UserView.vue"),
                },
                {
                    path: "userManagement",
                    name: "manageUserView",
                    component: ()=>import("@/views/miscellany/UserManagementView.vue"),
                },
                {
                    path: "competition",
                    name: "competitionSeries",
                    children: [
                        {
                            path: "",
                            name: "competitionHomeView",
                            component: () => import("@/views/competition/CompetitionView.vue"),
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
                            component: () => import("@/views/competition/CompetitionCheckListView.vue"),
                        },
                        {
                            path: ":teamId",
                            name: "teamCheck",
                            component: () => import("@/views/competition/CompetitionCheckView.vue")
                        },

                    ]
                }, 
                {
                    path: "patentCheck",
                    name: "patentCheckView",
                    children: [
                        {
                            path: "",
                            name: "patentCheckHomeView",
                            component: () => import("@/views/patent/PatentCheckListView.vue"),
                        },
                        {
                            path: ":id",
                            name: "patentCheck",
                            component: () => import("@/views/patent/PatentCheckView.vue")
                        },

                    ]
                },
                {
                    path: "competitionManage",
                    name: "competitionManage",
                    component: () => import("@/views/competition/CompetitionManagementView.vue")
                },
                {
                    path: "paper",
                    name: "paperView",
                    component: () => import("@/views/paper/PaperView.vue"),
                },
                {
                    path: "ChangePaperwork",
                    name: "ChangePaperwork",
                    component: () => import("@/views/paper/ChangePaperwork.vue"),
                },
                {
                    path: "patent",
                    name: "patentView",
                    component: () => import("@/views/patent/showPatentpage.vue"),
                },
                {
                    path: "patentDetail/:teamId",
                    name: "patentDetail",
                    component: () => import("@/views/patent/PatentView.vue"),
                },
                {
                    path: "ChangePatentwork",
                    name: "ChangePatentwork",
                    component: () => import("@/views/patent/ChangePatentwork.vue"),
                },
                {
                    path: "volunteers",
                    name: "volunteersView",
                    component: () => import("@/views/volunteer/showVolunteers.vue"),
                },
                {
                    path: "volunteersDetail",
                    name: "volunteersDetail",
                    component: () => import("@/views/volunteer/VolunteersView.vue"),
                },
                {
                    path: "volunteersSearch",
                    name: "volunteersSearch",
                    component: () => import("@/views/volunteer/volunteerChecklist.vue"),
                },
                {
                    path: "volunteersCheck",
                    name: "volunteersCheck",
                    component: () => import("@/views/volunteer/volunteerCheck.vue"),
                },
                {
                    path: "socialWork",
                    name: "socialWork",
                    component: () => import("@/views/social/showSocialWork.vue"),
                },
                {
                    path: "socialDetail",
                    name: "socialDetail",
                    component: () => import("@/views/social/SocialWork.vue"),
                },
                {
                    path: "changeVolunteers",
                    name: "changeVolunteers",
                    component: () => import("@/views/volunteer/ChangeVolunteers.vue"),
                },
                {
                    path: "changeSocialworks",
                    name: "changeSocialworks",
                    component: () => import("@/views/social/ChangeSocialwork.vue"),
                },
                {
                    path: "ticket",
                    name: "ticket",
                    children: [
                        {
                            path: "",
                            name: "ticketHomeView",
                            component: () => import("@/views/ticket/TicketHome.vue"),
                        },
                        {
                            path: "view/:ticketId",
                            name: "ticketView",
                            component: () => import("@/views/ticket/TicketView.vue")
                        },
                        {
                            path: "viewAdmin/:ticketId",
                            name: "ticketViewAdmin",
                            component: () => import("@/views/ticket/TicketViewAdmin.vue")
                        }]
                },
                {
                    path: "reviewTicket",
                    name: "reviewTicket",
                    component: () => import("@/views/ticket/ReviewTicket.vue")
                },
                {
                    path: "notice",
                    name: "notice",
                    component: () => import("@/views/notice/SendNotice.vue")
                }
            ]
        },

        { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import("@/pages/ErrorPage.vue") },
    ]
})

export default router
