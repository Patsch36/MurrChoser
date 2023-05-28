<script setup lang="ts">
import FileUpload from '@/components/FileUpload.vue'
import { ref } from 'vue';
import Excel from 'exceljs';

const excelFileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

let worksheets = ref<string[]>([]);
let selectedWorksheet =  ref<string | null>(null);

const handleFileSelected = (file: File) => {
  const reader = new FileReader();

  reader.onload = () => {
    const arrayBuffer = reader.result as ArrayBuffer;
    const uint8Array = new Uint8Array(arrayBuffer);
    const workbook = new Excel.Workbook();
    workbook.xlsx.load(uint8Array).then(() => {
      console.log('Datei eingelesen:', workbook);

      worksheets.value = workbook.worksheets.map(elem => elem.name)

      console.log(worksheets)
    }).catch((error) => {
      console.error('Fehler beim Einlesen der Datei:', error);
    });
  };

  reader.readAsArrayBuffer(file);
};
</script>

<template>
  <main>
    <h2>Dateiauswahl</h2>
    <div class="file-inputs">
      <FileUpload headerText="Anwesenheitsplan auswählen" :type = "excelFileType" @file-selected="handleFileSelected" class="fileupload"/>
      <FileUpload  headerText="Moderatorenplan auswählen" :type = "excelFileType" class="fileupload"/>
    </div>
    <h2>Worksheets</h2>
    <div>
    <select v-model="selectedWorksheet">
      <option v-for="item in worksheets" :value="item">{{ item }}</option>
    </select>
    <p>Ausgewähltes Element: {{ selectedWorksheet }}</p>
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
