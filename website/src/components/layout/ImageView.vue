<template>
  <div class="row justify-center">
    <q-avatar
        class="bg-white avatar-border"
        font-size="125px"
        :icon="`img:${props.src}`"
        style="height: 125px; width: auto"
    />
  </div>
</template>

<script setup>
/**
 * @property {String} src
 */
const props = defineProps({
  src: String
});
</script>

<style lang="scss" scoped>
</style>
