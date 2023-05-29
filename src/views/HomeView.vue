<script setup lang="ts">
import FileUpload from '@/components/FileUpload.vue'
import { ref } from 'vue';
import * as Excel from 'exceljs';
import SelectInput from '@/components/SelectInput.vue';

const excelFileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

let workbook = ref<Excel.Workbook>();
let worksheets = ref<string[]>([]);
let selectedWorksheet =  ref<string | null>(null);

const handleFileSelected = (file: File) => {
  const reader = new FileReader();

  reader.onload = () => {
    const arrayBuffer = reader.result as ArrayBuffer;
    const uint8Array = new Uint8Array(arrayBuffer);
    workbook.value = new Excel.Workbook();
    const wb = workbook.value;
    wb.xlsx.load(uint8Array).then(() => {
      console.log('Datei eingelesen:', workbook);

      worksheets.value = wb.worksheets.map(elem => elem.name)
      selectedWorksheet.value = worksheets.value[0]

      console.log(worksheets)
    }).catch((error) => {
      console.error('Fehler beim Einlesen der Datei:', error);
    });
  };

  reader.readAsArrayBuffer(file);
};


function findeZelleMitParameter(parameter: string): Excel.Cell | null {
  let worksheetname:string = ''
  if (selectedWorksheet.value)
    worksheetname= selectedWorksheet.value;
  if (!workbook.value)
    return null;
    const worksheet = workbook.value.getWorksheet(worksheetname);

  const numberOfRows = worksheet.rowCount
  const rows = worksheet.getRows(0, numberOfRows) ?? [];

  // Durchlaufe alle Zeilen im Arbeitsblatt
  for (let row of rows) {
    // Durchlaufe alle Zellen in der aktuellen Zeile
    const cellcount = row.cellCount;
    for (let index = 1; index <= cellcount; index++) {
      // Überprüfe, ob der Zellenwert mit dem Parameter übereinstimmt
      const cell = row.getCell(index)
      if (cell.value === parameter) {
        console.log(cell.value)
        console.log(cell.row)

        const datestring = worksheet.getCell("AJ7").value
        const dateString = datestring?.toLocaleString()
        if(!dateString)
          return null;
        const date = new Date(dateString)
        const options: Intl.DateTimeFormatOptions = {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        };
        console.log(date.toLocaleDateString('de-DE', options))
        return cell;
      }
    }
  }

  return null; // Zelle nicht gefunden
}
</script>

<template>
  <main>
    <h2>Dateiauswahl</h2>
    <div class="file-inputs">
      <FileUpload headerText="Anwesenheitsplan auswählen" :type = "excelFileType" @file-selected="handleFileSelected" class="fileupload"/>
      <FileUpload  headerText="Moderatorenplan auswählen" :type = "excelFileType" class="fileupload"/>
    </div>
    <h2>Worksheets</h2>
    <SelectInput :options="worksheets" @worksheet-selected="selectedWorksheet = $event"/>
    <p>Ausgewähltes Worksheet: {{ selectedWorksheet }}</p>
    <button v-if="workbook && selectedWorksheet" style="width:100px; height: 50px" @click="findeZelleMitParameter('Name')">Fire</button>
  </main>
</template>

<style>
main{
  margin-top: 16px;
}
.file-inputs{
  display: flex;
  flex-direction: row;
  gap: 10%;
}

.fileupload{
  width: 45%;
}
</style>
