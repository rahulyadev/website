<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-3">
    <div
      class="row justify-center bg-dark q-py-md"
      style="border-bottom: 1px solid grey"
    >
      <div class="col-12 q-my-sm">
        <image-view
          src="https://ryanbalieiro.github.io/vue-resume-template/images/pictures/avatar.png"
          alt="Rahul Yadav"
          style="min-height: 12vh"
        />
      </div>
      <div class="col-12 q-mt-sm">
        <div class="text-h6 text-white text-center">Rahul Yadav</div>
        <div class="text-subtitle2 text-grey-4 text-center">
          Software Engineer
        </div>
      </div>
    </div>
    <top-menu :subMenu="subMenu" v-model="baseStore.subTab" />
    <q-footer>
      <footer-menu :menu="baseStore.footerMenu" v-model="baseStore.tab" />
    </q-footer>
    <q-page-container style="height: fit-content">
      <q-page class="q-pa-lg" style="min-height: 10vh !important">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import ImageView from 'src/components/layout/ImageView.vue';
import TopMenu from 'src/components/layout/TopMenu.vue';
import FooterMenu from 'src/components/layout/FooterMenu.vue';
import useBaseStore from 'src/stores/base';
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const baseStore = useBaseStore();

const subMenu = computed(() => {
  const selectedMenu = baseStore.footerMenu.find(
    (menu) => menu.title === baseStore.tab,
  );
  return selectedMenu?.topMenu || [];
});

onMounted(() => {
  const routeName = route.name as string;

  baseStore.footerMenu.forEach(menu => {
    if (menu.pathName === routeName) {
      baseStore.tab = menu.title;
      baseStore.subTab = '';
    } else {
      menu.topMenu.forEach(subMenu => {
        if (subMenu.pathName === routeName) {
          menu.lastActive = subMenu.title;
          baseStore.tab = menu.title;
        }
      });
    }
  });
});
</script>
