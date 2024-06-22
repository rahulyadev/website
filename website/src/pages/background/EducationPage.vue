<template>
  <section-details
    title-first-part="Education"
    description="A glimpse into my academic trajectory and accomplishments."
  />
  <time-line :items="orderedItems" />
</template>

<script setup lang="ts">
import SectionDetails from 'src/components/common/SectionDetails.vue';
import TimeLine from 'src/components/common/TimeLine.vue';
import { ref, computed } from 'vue';
import { TimeLineItem } from 'src/models/common';

const domain = window.location.origin;

const items = ref<TimeLineItem[]>([
  {
    id: 1,
    title: 'Bachelors of Engineering in Computer Science',
    place: {
      name: 'University of Mumbai',
      logoUrl: `${domain}/icons/mu.png`,
      faIcon: 'school',
    },
    period: ['2016-07-15', '2020-09-15'],
    description:
      'Graduated with a solid foundation in computer science. Acquired expertise in programming, data structures, algorithms, and software development.',
  },
]);

const orderedItems = computed(() => {
  return [...items.value].reverse();
});
</script>
