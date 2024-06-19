<template>
  <div class="social-links">
    <!-- Social Button -->
    <a
      v-for="item in items"
      class="btn btn-social"
      target="_blank"
      :href="item['href']"
      :aria-label="item['faIcon']"
      :key="item['id']"
    >
      <!-- ToolTip -->
      <q-tooltip anchor="top middle" self="bottom middle" class="bg-purple text-caption" v-if="item['id']">
        {{ item['id'] }}
      </q-tooltip>

      <!-- Social Button Icon -->
      <i :class="item['faIcon']" />
    </a>
  </div>
</template>

<script setup>
const items = {
  address: {
    id: 'address',
    value: '123 Main Street, Cupertino, CA 01234',
    valueShort: 'Cupertino, CA 01234',
    faIcon: 'fa-solid fa-city',
    href: null,
  },

  email: {
    id: 'email',
    value: 'jonas.einstein@genius.com',
    valueShort: 'jonas.einstein@genius.com',
    faIcon: 'fa-solid fa-envelope',
    href: 'mailto:jonas.einstein@genius.com',
  },

  facebook: {
    id: 'facebook',
    value: 'Jonas Einstein',
    valueShort: 'J. Einstein',
    faIcon: 'fa-brands fa-facebook',
    href: 'https://facebook.com',
  },

  github: {
    id: 'github',
    value: '@jonas.einstein.official',
    valueShort: '@jonas.einstein.official',
    faIcon: 'fa-brands fa-github',
    href: 'https://github.com',
  },

  instagram: {
    id: 'instagram',
    value: '@jonas.einstein.official',
    valueShort: '@jonas.einstein.official',
    faIcon: 'fa-brands fa-instagram',
    href: 'https://instagram.com',
  },

  linkedin: {
    id: 'linkedin',
    value: '@jonas.einstein.official',
    valueShort: '@jonas.einstein.official',
    faIcon: 'fa-brands fa-linkedin',
    href: 'https://linkedin.com',
  },

  phone: {
    id: 'phone',
    value: '+1 (123) 456-7890',
    valueShort: '(123) 456-7890',
    faIcon: 'fa-solid fa-phone',
    href: 'tel:1234567890',
  },
};
</script>

<style lang="scss" scoped>


.btn-social {
  display: inline-flex;
  justify-content: center;
  align-items: center;

  border-radius: 100%;
  border-width: 4px;
  border-color: lighten(#212529, 7%);

  background-color: lighten(#212529, 5%);
  color: white;

  &:hover,
  &:active {
    color: white;
    border-color: darken(#9716f1, 5%);
    background-color: #9716f1;
  }

  &:not(:first-child),
  &:not(:last-child) {
    margin: 0 0.3rem;
  }

  width: 1.1rem * 2.4;
    height: 1.1rem * 2.4;
    font-size: 1.1rem;
}

.social-link-tooltip {
  position: absolute;
  margin-top: -6rem;
  text-transform: capitalize;
  background-color: darken(#9716f1, 20%);
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  display: none;

  &::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: darken(#9716f1, 20%) transparent transparent transparent;
  }
}

.btn-social:hover {
  .social-link-tooltip {
    display: block !important;
  }
}
</style>
