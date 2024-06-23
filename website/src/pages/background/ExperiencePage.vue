<template>
  <section-details
    title-first-part="Experience"
    description="A look into my work experience and career journey."
  />
  <time-line :items="items" />
</template>

<script setup lang="ts">
import SectionDetails from 'src/components/common/SectionDetails.vue';
import TimeLine from 'src/components/common/TimeLine.vue';
import { ref } from 'vue';
import { TimeLineItem } from 'src/models/common';

const domain = window.location.origin;

const items = ref<TimeLineItem[]>([
  {
    id: 1,
    title: 'Software Engineer',
    place: {
      name: 'Gainfront',
      logoUrl: `${domain}/icons/gainfront.svg`,
      faIcon: 'school',
    },
    period: ['2023-06-15', 'Present'],
description: [
      'Migrate technology from Django to Django Rest Framework and Vue.js for supplier module, ensuring customer-specific form customization. Resulted in faster on-boarding of the new customers.',
      'Develop a new request for price module, enhancing up-selling opportunities for existing customers.',
      'Build Target spend module from scratch as POC, now a full fledged sub module of the spend analytics module.',
      'Significantly contribute to product enhancements, driving measurable customer satisfaction.',],
      paragraph: false,
  },
  {
    id: 2,
    title: 'Software Engineer',
    place: {
      name: 'MarsDevs',
      logoUrl: `${domain}/icons/mr.png`,
      faIcon: 'online_prediction',
    },
    period: ['2020-11-13', '2023-06-14'],
    description:
      [
        'Polestar (June 2021 - June 2023): Enhanced the online electric vehicle purchasing experience by improving the website, utilizing technologies including Python, Django, Vue.js, Nuxt.js, Jest, Docker, Travis CI, and Squash. Optimized the website before a Super Bowl ad, handling millions of user traffic efficiently.',
        'Castapp (March 2021 - June 2021): Focused on enhancing the data-driven video creation feature, utilizing Flask, React, and various Google Cloud Platform services such as App Engine, Tasks, Document AI, and Storage. Achieved a 60% improvement in video creation speed.',
        'Medtrics (November 2020 - March 2021): Resolved a range of issues, enhanced backend test coverage, and aided in the transition from vanilla JavaScript to Vue.js for the frontend. Utilized Django, JavaScript, and Vue.js.',
        'TyreExpress: PDF Reports: Developed PDF reports to assess the health and performance of tires using the reportlab library and stored data, showcasing expertise in Python and data visualization.',
      ],
      paragraph: false,
  },
]);
</script>
