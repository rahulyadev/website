<template>
  <div class="text-h3 text-dark text-bold text-uppercase">
    <!-- <span class="text-primary">{{ titleFirstPart }}</span> {{ titleSecondPart }} -->
     {{ titleFirstPart }} {{ titleSecondPart }}
  </div>
  <q-separator class="q-mt-xs q-mb-sm" size="2px" color="accent" width="60" />
  <p v-if="description" class="text-body1 text-primary text-justify">{{ description }}</p>
</template>
<script setup lang="ts">
interface SectionDetailsProps {
  titleFirstPart: string;
  titleSecondPart?: string;
  description?: string;
}

withDefaults(defineProps<SectionDetailsProps>(), {
  titleSecondPart: '',
  description: '',
});
</script>
