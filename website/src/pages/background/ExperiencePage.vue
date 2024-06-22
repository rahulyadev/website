<template>
    <section-details
      title-first-part="Experience"
      description="A look into my work experience and career journey."
    />
    <time-line :items="orderedItems"/>
</template>

<script setup lang="ts">
import SectionDetails from 'src/components/common/SectionDetails.vue';
import TimeLine from 'src/components/common/TimeLine.vue';
import { ref, computed } from 'vue';
import { TimeLineItem } from 'src/models/common';

const items = ref<TimeLineItem[]>([
  {
    id: 1,
    title: "Bachelor's in Graphic Design with UX Emphasis",
    place: {
      name: 'Harvard University',
      logoUrl: 'https://via.placeholder.com/100',
      faIcon: 'school',
    },
    period: ['2014-08-01', '2018-05-01'],
    description:
      'Graduated with a solid foundation in graphic design while specializing in user experience design. Acquired expertise in visual storytelling, UI design, and collaborative design thinking.',
  },
  {
    id: 2,
    title: 'UX Fundamentals Online Certification',
    place: {
      name: 'Udacity',
      logoUrl: 'https://via.placeholder.com/100',
      faIcon: 'online_prediction',
    },
    period: ['2014-01-01', '2014-07-01'],
    description:
      'Enrolled in an online program covering essential UX concepts, including user research, usability testing, and information architecture. Strengthened skills in creating intuitive and user-friendly digital experiences.',
  },
]);

const orderedItems = computed(() => {
  return [...items.value].reverse();
});

</script>
