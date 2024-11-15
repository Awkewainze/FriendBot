<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})
</script>

<template>
  <div>
    <h1>{{ error!.statusCode }}</h1>
    <h2>{{ error!.message }}</h2>
    <NuxtLink to="/">Go back home</NuxtLink>
  </div>
</template>
