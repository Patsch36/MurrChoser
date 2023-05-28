<script setup lang="ts">
import FileUpload from '@/components/FileUpload.vue'

const excelFileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
</script>

<template>
  <main>
    <h2>Dateiauswahl</h2>
    <div class="file-inputs">
      <FileUpload headerText="Anwesenheitsplan auswählen" :type = "excelFileType" class="fileupload"/>
      <FileUpload  headerText="Moderatorenplan auswählen" :type = "excelFileType" class="fileupload"/>
    </div>
  </main>
</template>

<style>
main{
  margin-top: 16px;
}
.file-inputs{
  display: flex;
  flex-direction: row;
  gap: 5%;
}

.fileupload{
  width: 45%;
}
</style>
