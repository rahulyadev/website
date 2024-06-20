<template>
  <q-avatar
    v-for="(link, index) in props.links"
    :key="index"
    class="q-mr-sm"
    size="lg"
    color="dark"
    text-color="white"
    :icon="link.icon"
    @click="onClick(link.link)"
  >
    <q-tooltip
      anchor="top middle"
      self="bottom middle"
      class="bg-purple text-caption"
      v-if="link.title"
    >
      {{ link.title }}
    </q-tooltip>
  </q-avatar>
  <!-- <a
      v-for="item in links"
      class="btn btn-social"
      target="_blank"
      :href="item['href']"
      :aria-label="item['faIcon']"
      :key="item['id']"
    >
      <q-tooltip
        anchor="top middle"
        self="bottom middle"
        class="bg-purple text-caption"
        v-if="item['id']"
      >
        {{ item['id'] }}
      </q-tooltip>
      <i :class="item['faIcon']" />
    </a> -->
</template>
<script setup lang="ts">
import { SocialLinks } from 'src/models/common';
interface SocialLinksProps {
  links: SocialLinks[];
}

const props = withDefaults(defineProps<SocialLinksProps>(), {});
const onClick = (url: string) => {
  window.open(url, '_blank');
};
</script>

<style lang="scss" scoped>
// .btn-social {
//   display: inline-flex;
//   justify-content: center;
//   align-items: center;

//   border-radius: 100%;
//   border-width: 4px;
//   border-color: lighten(#212529, 7%);

//   background-color: lighten(#212529, 5%);
//   color: white;

//   &:hover,
//   &:active {
//     color: white;
//     border-color: darken(#9716f1, 5%);
//     background-color: #9716f1;
//   }

//   &:not(:first-child),
//   &:not(:last-child) {
//     margin: 0 0.3rem;
//   }

//   width: 1.1rem * 2.4;
//   height: 1.1rem * 2.4;
//   font-size: 1.1rem;
// }

// .social-link-tooltip {
//   position: absolute;
//   margin-top: -6rem;
//   text-transform: capitalize;
//   background-color: darken(#9716f1, 20%);
//   padding: 0.2rem 0.6rem;
//   border-radius: 10px;
//   display: none;

//   &::before {
//     content: '';
//     position: absolute;
//     top: 100%;
//     left: 50%;
//     margin-left: -5px;
//     border-width: 5px;
//     border-style: solid;
//     border-color: darken(#9716f1, 20%) transparent transparent transparent;
//   }
// }

// .btn-social:hover {
//   .social-link-tooltip {
//     display: block !important;
//   }
// }
</style>
