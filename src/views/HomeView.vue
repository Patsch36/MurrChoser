<script setup lang="ts">
import FileUpload from '@/components/FileUpload.vue'
</script>

<template>
  <main>
    <div class="file-inputs">
      <FileUpload headerText="Anwesenheitsplan auswählen" class="fileupload"/>
      <FileUpload  headerText="Moderatorenplan auswählen" class="fileupload"/>
    </div>
  </main>
</template>

<style>
.file-inputs{
  display: flex;
  flex-direction: row;
  gap: 5%;
}

.fileupload{
  width: 45%;
}
</style>
