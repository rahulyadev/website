import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { FooterMenu } from 'src/models/base';
import {useRouter} from 'vue-router';

export default defineStore('base', () => {
  const router = useRouter();
  const footerMenu = ref<FooterMenu[]>([
    {
      title: 'Home',
      icon: 'fa-solid fa-home',
      pathName: 'Home',
      topMenu: [],
      lastActive: '',
      lastActivePath: 'Home',
    },
    {
      title: 'Background',
      icon: 'fa-solid fa-clock',
      pathName: 'Background',
      topMenu: [
        {
          title: 'Education',
          pathName: 'Education',
          icon: 'fa-solid fa-graduation-cap',
        },
        {
          title: 'Experience',
          pathName: 'Experience',
          icon: 'fa-solid fa-briefcase',
        },
      ],
      lastActive: 'Education',
      lastActivePath: 'Education',
    },
    {
      title: 'Showcase',
      icon: 'fa-solid fa-images',
      pathName: 'Showcase',
      topMenu: [
        {
          title: 'Skills',
          pathName: 'Skills',
          icon: 'fa-solid fa-tools',
        },
        {
          title: 'Projects',
          pathName: 'Projects',
          icon: 'fa-solid fa-project-diagram',
        },
        {
          title: 'Achievements',
          pathName: 'Achievements',
          icon: 'fa-solid fa-trophy',
        },
      ],
      lastActive: 'Skills',
      lastActivePath: 'Skills',
    },
  ]);

  const tab = ref('Home');
  const subTab = ref('');

  watch(tab, (newTab) => {
    const selectedMenu = footerMenu.value.find((menu) => menu.title === newTab);
    if (selectedMenu && selectedMenu.topMenu.length > 0) {
      subTab.value = selectedMenu.lastActive;
      router.push({ name: selectedMenu.lastActivePath });
    } else {
      subTab.value = '';
      router.push({ name: selectedMenu?.pathName || footerMenu.value[0].pathName });
    }
  });

  watch(subTab, (newSubTab) => {
    const selectedMenu = footerMenu.value.find((menu) => menu.title === tab.value);
    const selectedTab = selectedMenu?.topMenu.find((menu) => menu.title === newSubTab);
    if (selectedMenu) {
      selectedMenu.lastActive = newSubTab;
      router.push({ name: selectedTab?.pathName || footerMenu.value[0].pathName});
    }
  });

  return {
    footerMenu,
    tab,
    subTab,
  };
});
