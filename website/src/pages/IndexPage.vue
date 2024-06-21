<template>
  <div>
    <section-details
      title-first-part="Welcome!"
    />
    <div class="q-mb-md">
      <q-item class="q-px-xs q-py-none" style="min-height: 10px;">
          <div class="text-normal text-weight-light q-pa-none"><q-avatar class="q-mr-xs q-mb-xs" icon="fa-solid fa-city" color="transparent" text-color="dark" size="sm" />Runwal Pearl, Thane west, Maharashtra</div>
      </q-item>
      <q-item tag="a" class="q-px-xs q-py-none" style="min-height: 10px;" href="mailto:rahulyadav109708@gmail.com">
          <div class="text-normal text-weight-light text-purple q-pa-none"><q-avatar class="q-mr-xs q-mb-xs" icon="fa-solid fa-envelope" color="transparent" text-color="dark" size="sm" />rahulyadav109708@gmail.com</div>
      </q-item>
      <q-item tag="a" class="q-px-xs q-py-none" style="min-height: 10px;" href='tel:+919619563665'>
          <div class="text-normal text-weight-light text-purple q-pa-none"><q-avatar class="q-mr-xs q-mb-xs" icon="fa-solid fa-phone" color="transparent" text-color="dark" size="sm" />+91 9619563665</div>
      </q-item>
    </div>
    <div>
      <p class="lead text-normal mb-4 mb-md-5 text-justify">
        I am a passionate software engineer with a knack for backend
        technologies and a good knowledge of frontend technologies. I thrive on
        solving real-world software problems and exploring the system designs
        used to tackle complex issues. Additionally, I have a strong foundation
        in classical machine learning and possess the requisite mathematical
        prowess.
      </p>
      <p class="lead text-normal mb-4 mb-md-5 text-justify">
        I have strong knowledge and experience with Python and Django, and good
        knowledge of JavaScript and VueJS. Currently, I am learning Go and
        related backend technologies. During my leisure time, you’ll find me
        honing my problem-solving skills on LeetCode and reading system design
        blogs.
      </p>
    </div>
    <social-links :links="commonStore.socialLinks" />
  </div>
</template>

<script setup>
import SocialLinks from 'src/components/common/SocialLinks.vue';
import SectionDetails from 'src/components/common/SectionDetails.vue';
import useCommonStore from 'src/stores/common';

const commonStore = useCommonStore();
</script>
