<template>
  <div class="row justify-center profile-container">
      <q-avatar
        class="bg-white avatar-border"
        :font-size="`${props.size}px`"
        :icon="`img:${props.src}`"
        :style="`height: ${props.size}px; width: auto; border-radius: 50%; border: solid ${props.borderWidth}px #d3d3d3; box-sizing: content-box;`"
      />
  </div>
</template>

<script setup lang="ts">
interface ImageViewProps {
  src: string;
  borderWidth: number;
  size: number;
}

const props = withDefaults(defineProps<ImageViewProps>(), {
  borderWidth: 3,
  size: 125,
});
</script>

<style lang="scss" scoped>
.profile-container {
  z-index: 101;

  .avatar-border {
    border-radius: 50%;
  }

  .avatar-border {
    border: solid 3px #d3d3d3;
    box-sizing: content-box;
  }
}
</style>
