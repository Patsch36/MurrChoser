<script setup lang="ts">
import FileUpload from '@/components/FileUpload.vue'
import { computed, pushScopeId, ref } from 'vue';
import * as Excel from 'exceljs';
import SelectInput from '@/components/SelectInput.vue';
import {isHoliday} from 'feiertagejs'

const excelFileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

const workbook = ref<Excel.Workbook>();
const worksheets = ref<string[]>([]);
const selectedWorksheet =  ref<string | null>(null);
const dateObj = ref<Date>(new Date());

  
const dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };


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
    }).catch((error) => {
      console.error('Fehler beim Einlesen der Datei:', error);
    });
  };

  reader.readAsArrayBuffer(file);
};


function findCellWithParameter(parameter: string): Excel.Cell | null {
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
        return cell;
      }
    }
  }

  return null; // Zelle nicht gefunden
}


const getDate = () => {
  const date = new Date(dateObj.value)
  return date.toLocaleString('de-DE', dateOptions)
}

const getPeople = computed(() => {
  const people: string[] = [];
  const cellWithName = findCellWithParameter('Name')
  const cellWithForname = findCellWithParameter('Vorname')

  let worksheetname:string = ''
  if (selectedWorksheet.value)
    worksheetname= selectedWorksheet.value;
  if (!workbook.value)
    return [];
  const worksheet = workbook.value.getWorksheet(worksheetname);

  if (! cellWithName || !cellWithForname)
    return [];

  
  let cellWithDate: Excel.Cell = worksheet.getCell('A1')
  const rowNumber = parseInt(cellWithName.row)
  const rows = worksheet.getRow(rowNumber)
  const cellCount = rows.cellCount

  for (let index = 1; index <= cellCount; index++) {
    const text = rows.getCell(index).value?.toString()
    if (!text)
      return [];
    const date = new Date(text)

    const chosenDate = new Date(dateObj.value)

    if (chosenDate.getDate() % 7 === 6 || chosenDate.getDate() % 7 === 0 || isHoliday(chosenDate, 'BW')){
      return [];
    }

    if (date.toLocaleString('de-DE', dateOptions) === getDate())
      cellWithDate = rows.getCell(index)
  }


  const columnName = worksheet.getColumn(cellWithName.col)
  const startindex = parseInt(cellWithName.row)

  // const leastLength = Math.min(...[columbName.values.length, columnForname.values.length, columnDate.values.length])
  for (let index = startindex; index <= columnName.values.length; index ++){
    if (worksheet.getCell(index, cellWithDate.col).value?.toString() === undefined){
      
      const forname = worksheet.getCell(index, cellWithForname.col).value?.toString()
      const name = worksheet.getCell(index, cellWithName.col).value?.toString()

      if (!forname || !name || forname === name)
        continue

      people.push(forname.concat(' ', name))
    }
  }
  return people
});



// if (workbook.value !== undefined)
// {
//   let worksheet = workbook.value.getWorksheet(0)
//   selectedWorksheet.value = worksheet.name
// }
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
    <input type="date" name="" id="" v-model="dateObj"  pattern="\d{2}.\d{2}.\d{4}">
    <p>{{ getDate() }}</p>
    <ul>
      <li v-for="name in getPeople" :key="name">{{ name }}</li>
    </ul>
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
