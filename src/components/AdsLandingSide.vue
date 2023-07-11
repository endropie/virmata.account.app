<template>
  <q-carousel
    v-model="slide"
    transition-prev="scale"
    transition-next="scale"
    swipeable
    animated
    control-color="primary"
    autoplay
    navigation
    padding
    arrows
    height="100%"
    class="bg-accent text-primary shadow-1 rounded-borders"
  >
    <q-carousel-slide name="style" class="column no-wrap flex-center">
      <q-icon name="style" size="105px" />
      <div class="q-mt-md text-center">
        {{ lorem }}
      </div>
    </q-carousel-slide>
    <q-carousel-slide name="tv" class="column no-wrap flex-center">
      <q-icon name="live_tv" size="105px" />
      <div class="q-mt-md text-center">
        {{ lorem }}
      </div>
    </q-carousel-slide>
    <q-carousel-slide name="layers" class="column no-wrap flex-center">
      <q-icon name="layers" size="105px" />
      <div class="q-mt-md text-center">
        {{ lorem }}
      </div>
    </q-carousel-slide>
    <q-carousel-slide name="map" class="column no-wrap flex-center">
      <q-icon name="terrain" size="105px" />
      <div class="q-mt-md text-center">
        {{ lorem }}
      </div>
    </q-carousel-slide>
  </q-carousel>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'AdsLandingSide',
  setup() {

    return {
      slide: ref('style'),
      lorem: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Itaque voluptatem totam, architecto cupiditate officia rerum, error dignissimos praesentium libero ab nemo provident incidunt ducimus iusto perferendis porro earum. Totam, numquam?'
    };
  },
});
</script>
