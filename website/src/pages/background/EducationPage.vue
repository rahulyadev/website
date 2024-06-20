<template>
  <div>
    <section-details
      title-first-part="Education"
      description="Section Description"
    />
    <div>
      <div class="text-h3 text-accent">Cover Title</div>
      <p class="lead text-normal mb-4 mb-md-5 text-justify">
        With 8 years as a UX designer, I excel in user-centric interfaces. My
        passion for empathetic design drives me to create delightful and
        innovative digital experiences. Let's collaborate and craft something
        extraordinary together.
      </p>
      <social-links />
    </div>
  </div>
</template>

<script setup>
import SocialLinks from 'src/components/common/SocialLinks.vue';
import SectionDetails from 'src/components/common/SectionDetails.vue';
</script>
