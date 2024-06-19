import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export default defineStore('base', () => {
  const footerMenu = ref([
    {
      title: 'Home',
      icon: 'fa-solid fa-home',
      link: '/',
      topMenu: [],
      lastActive: '',
    },
    {
      title: 'Backgroud',
      icon: 'fa-solid fa-clock',
      link: '/background',
      topMenu: [
        {
          title: 'Education',
          link: '/background/education',
          icon: 'fa-solid fa-graduation-cap',
        },
        {
          title: 'Experience',
          link: '/background/experience',
          icon: 'fa-solid fa-briefcase',
        },
      ],
      lastActive: 'Education',
    },
    {
      title: 'Showcase',
      icon: 'fa-solid fa-images',
      link: '/showcase',
      topMenu: [
        {
          title: 'Skills',
          link: '/showcase/skills',
          icon: 'fa-solid fa-tools',
        },
        {
          title: 'Projects',
          link: '/showcase/projects',
          icon: 'fa-solid fa-project-diagram',
        },
        {
          title: 'Achievements',
          link: '/showcase/achievements',
          icon: 'fa-solid fa-trophy',
        },
      ],
      lastActive: 'Skills',
    },
  ]);

  const tab = ref('Home');
  const subTab = ref('');

  watch(tab, (newTab) => {
    const selectedMenu = footerMenu.value.find((menu) => menu.title === newTab);
    if (selectedMenu && selectedMenu.topMenu.length > 0) {
      subTab.value = selectedMenu.lastActive;
    } else {
      subTab.value = '';
    }
  });

  watch(subTab, (newSubTab) => {
    const selectedMenu = footerMenu.value.find((menu) => menu.title === tab.value);
    if (selectedMenu) {
      selectedMenu.lastActive = newSubTab;
    }
  });

  return {
    footerMenu,
    tab,
    subTab,
  };
});
