<template>
  <q-page style="min-height: 10vh !important;">
    <!-- Website Section -->
    <section id="1" class="section">
      <!-- Section Container -->
      <div class="section-container">
        <!-- Section Header -->
        <div class="section-header">
          <!-- Title -->
          <div class="text-h3 text-accent">
            <span class="text-primary">Section</span> Title
          </div>

          <!-- Divider -->
          <!-- <q-separator class="col-12 q-mb-md" size="1px" color="grey-4" /> -->

          <!-- Description -->
          <p class="text-body1 text-primary">Section Description</p>
        </div>

        <!-- Section Content -->
        <div class="section-content">
          <!-- Title -->
          <div class="text-h3 text-accent"> Cover Title </div>

          <!-- Divider -->
          <!-- <q-separator class="col-12 q-mb-md" size="1px" color="grey-4" /> -->

          <!-- Info Items -->
          <!-- <InlineList
            class="info-list"
            :items="props.sectionData.content['items']['contactListItems']"
          /> -->

          <!-- Description -->
          <p
            class="cover-description lead text-normal mb-4 mb-md-5"
          > With 8 years as a UX designer, I excel in user-centric interfaces. My passion for empathetic design drives me to create delightful and innovative digital experiences. Let's collaborate and craft something extraordinary together. </p>

          <!-- Social Links -->
          <social-links />
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import SocialLinks from 'src/components/SocialLinks.vue'
</script>

<style lang="scss" scoped>
.section {
  position: relative;
  display: flex;
}

.section-container {
  width: min(100%, 2048px);
  padding: 1.5rem 1.2rem 3rem;
  margin-bottom: 60px;
}

.section-header {
  margin-bottom: 1.5rem;
}


.cover-title {
    margin-bottom: 1rem;
    text-transform: uppercase;
    font-weight: bold;
}

.info-list {
  margin-bottom: 1.2rem;
}
</style>
