import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('pages/IndexPage.vue'),
      },
    ],
  },
  {
    path: '/background',
    name: 'Background',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Background',
        redirect: '/background/education',
      },
      {
        path: 'education',
        name: 'Education',
        component: () => import('pages/background/EducationPage.vue'),
      },
      {
        path: 'experience',
        name: 'Experience',
        component: () => import('pages/background/ExperiencePage.vue'),
      },
    ],
  },
  {
    path: '/showcase',
    name: 'Showcase',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Showcase',
        redirect: '/showcase/skills',
      },
      {
        path: 'skills',
        name: 'Skills',
        component: () => import('pages/showcase/SkillsPage.vue'),
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('pages/showcase/ProjectsPage.vue'),
      },
      {
        path: 'achievements',
        name: 'Achievements',
        component: () => import('pages/showcase/AchievementsPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
