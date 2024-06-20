<template>
  <q-tabs
    v-model="modelValue"
    align="justify"
    indicator-color="transparent"
    active-color="purple-4"
    class="bg-dark"
  >
    <q-tab
      v-for="(menu, index) in props.menu"
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
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { FooterMenu } from 'src/models/base';

const emit = defineEmits(['update:modelValue']);

interface TopMenuProps {
  modelValue: string;
  menu: FooterMenu[];
}

const props = withDefaults(defineProps<TopMenuProps>(), {});

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);
  },
});
</script>
