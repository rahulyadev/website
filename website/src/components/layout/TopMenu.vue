<template>
  <q-tabs
    v-if="subMenu && subMenu.length > 0"
    v-model="modelValue"
    align="justify"
    active-color="white"
    active-bg-color="grey-10"
    inline-label
    switch-indicator
    no-caps
    indicator-color="purple-4"
    class="bg-dark stick-top-menu"
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
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { TopMenu } from 'src/models/base';

const emit = defineEmits(['update:modelValue']);

interface TopMenuProps {
  modelValue: string;
  subMenu: TopMenu[];
}

const props = withDefaults(defineProps<TopMenuProps>(), {});

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);
  },
});
</script>

<style lang="scss" scoped>
.stick-top-menu {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
