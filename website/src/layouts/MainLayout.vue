<template>
  <q-layout view="lHh Lpr lFf">
    <div class="row justify-center bg-dark q-py-md" style="border-bottom: 1px solid grey;">
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
    <q-tabs
      v-if="subMenu && subMenu.length > 0"
      v-model="baseStore.subTab"
      align="justify"
      active-color="white"
      active-bg-color="grey-10"
      inline-label
      switch-indicator
      no-caps
      indicator-color="purple-4"
      class="bg-dark"
    >
      <q-tab
        v-for="(menu, index) in subMenu"
        :key="index"
        :ripple="false"
        :name="menu.title"
        class="q-py-sm text-caption text-grey-4"
      >
        <div class="text-caption text-grey-4 text-center">
          <q-icon class="q-mr-xs q-mb-xs" :name="menu.icon" />
          {{ menu.title }}
        </div>
      </q-tab>
    </q-tabs>
    <q-footer>
      <q-tabs
        v-model="baseStore.tab"
        align="justify"
        indicator-color="transparent"
        active-color="purple-4"
        class="bg-dark"
      >
        <q-tab
          v-for="(menu, index) in baseStore.footerMenu"
          :key="index"
          :ripple="false"
          :name="menu.title"
          class="q-py-sm"
        >
          <q-icon class="q-mb-xs" :name="menu.icon" />
          <div class="text-caption text-grey-4 text-center">
            {{ menu.title }}
          </div>
        </q-tab>
      </q-tabs>
    </q-footer>
    <q-page-container style="height: fit-content;">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import ImageView from 'src/components/ImageView.vue';
import useBaseStore from 'src/stores/base';
import { computed } from 'vue';

const baseStore = useBaseStore();

const subMenu = computed(() => {
  const selectedMenu = baseStore.footerMenu.find(
    (menu) => menu.title === baseStore.tab,
  );
  return selectedMenu?.topMenu || [];
});
</script>
