<template>
  <div class="timeline">
    <!-- Timeline Items -->
    <div
      v-for="item in props.items"
      :key="item.id"
      class="timeline-item row no-wrap"
    >
      <!-- Logo Wrapper -->
      <div class="col-auto">
        <image-view :src="item.place.logoUrl" alt="Rahul Yadav" :size="40" />
      </div>

      <!-- Item Content -->
      <div class="col q-ml-md">
        <!-- Item Header -->
        <div class="item-header items-center no-wrap">
          <div class="text-h6 text-weight-bold q-mb-xs q-mt-none" style="line-height: 23px;">{{ item.title }}</div>
          <div class="text-normal text-grey-8 q-ml-md">
            <q-icon name="business" class="q-mb-xs" size="14px" />
            {{ item.place.name }}
          </div>
          <q-chip size="12px" class="bg-white" style="margin-left: 7px">
            <q-icon name="event" color="grey-9" class="q-mr-xs" />
            <span class="text-grey-9"
              >{{ toReadableDate(item.period[0]) }} ➔
              {{ toReadableDate(item.period[1]) }}</span
            >
          </q-chip>
        </div>

        <!-- Item Body -->
        <div class="item-body q-mt-md">
          <p>{{ item.description }}</p>
        </div>
      </div>
    </div>

    <!-- Timeline Trailing Item -->
    <div class="timeline-item-tail">
      <q-icon name="circle" size="30px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ImageView from 'src/components/layout/ImageView.vue';
import { TimeLineItem } from 'src/models/common';
import { date } from 'quasar';

interface TimeLineProps {
  items: TimeLineItem[];
}

const props = withDefaults(defineProps<TimeLineProps>(), {});

const toReadableDate = (value: string) => {
  return date.formatDate(value, 'MMM YYYY');
};
</script>

<style scoped>
.timeline {
  position: relative;
  padding: 0;
  list-style: none;
}

.timeline:before {
  position: absolute;
  top: 20px;
  bottom: 15px;
  left: 22px;
  width: 3px;
  content: '';
  background-color: #d3d3d3;
}

.timeline-item {
  position: relative;
  margin-bottom: 30px;
}

.timeline-item-tail {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-left: 8px;
}

.timeline-item-tail .q-icon {
  color: #d3d3d3;
}
</style>
