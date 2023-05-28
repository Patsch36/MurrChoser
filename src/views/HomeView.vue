<script setup lang="ts">
import FileUpload from '@/components/FileUpload.vue'
</script>

<template>
  <main>
    <FileUpload :maxSize="5" accept="png" />
  </main>
</template>
