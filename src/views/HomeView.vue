<script setup lang="ts">
import FileUpload from '@/components/FileUpload.vue'
import { computed, ref } from 'vue';
import * as Excel from 'exceljs';
import {isHoliday} from 'feiertagejs'
import RadioButtonInput from '@/components/RadioButtonInput.vue';
import { type Moderatoren, type Moderator, getCellValue } from '@/types/Moderatorenliste';
import { countModerators } from "@/functions/dictionaryCounter";
import Table from '@/components/Table.vue';
import DateInput from '@/components/DateInput.vue';
import PresenterCard from '@/components/PresenterCard.vue';
import NumbersInput from '@/components/NumbersInput.vue';

const excelFileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  
const dateOptions: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
};


const workbookAnwesenheit = ref<Excel.Workbook>();
const workbookModeratoren = ref<Excel.Workbook>();
const dateObj = ref<string>(new Date().toLocaleDateString('de-DE', dateOptions));
const group = ref<string>('');
const moderatoren = ref<Moderator[]>([]);
const bachelorModeratoren = ref<string[]>([]);
const prepareTime = ref<number>(14);

const ops: string[] = ['Alle Azubis / Studenten', 'Bachelorstudenten auslassen']
const selectedOps = 1;

const mod1 = ref<string>('')
const mod2 = ref<string>('')


const handleFileSelected = (file: File) => {
  const reader = new FileReader();

  reader.onload = () => {
    const arrayBuffer = reader.result as ArrayBuffer;
    const uint8Array = new Uint8Array(arrayBuffer);
    workbookAnwesenheit.value = new Excel.Workbook();
    workbookAnwesenheit.value.xlsx.load(uint8Array).then(() => {
      console.log('Datei eingelesen:', workbookAnwesenheit.value);

      // worksheets.value = wb.worksheets.map(elem => elem.name)
      
    }).catch((error) => {
      console.error('Fehler beim Einlesen der Datei:', error);
    });
  };

  reader.readAsArrayBuffer(file);
};


function findCellWithParameter(parameter: string, worksheetname: string): Excel.Cell | null {
  if (!workbookAnwesenheit.value || workbookAnwesenheit.value === undefined)
    return null;
  
  const worksheet = workbookAnwesenheit.value.getWorksheet(worksheetname);

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


const newdate = (newdate: string) => {
  const date = new Date(newdate)
  dateObj.value = date.toLocaleString('de-DE', dateOptions)
};

const getPeople = computed(() => {
  const people: string[] = [];
  if(workbookAnwesenheit.value === undefined)
    return [];
  if (!workbookAnwesenheit.value)
    return [];
  
  const worksheetnames = workbookAnwesenheit.value.worksheets.map(elem => elem.name)
  for (const worksheetname of worksheetnames)
  {

    const cellWithName = findCellWithParameter('Name', worksheetname)
    const cellWithForname = findCellWithParameter('Vorname', worksheetname)

    const worksheet = workbookAnwesenheit.value.getWorksheet(worksheetname);

    if (! cellWithName || !cellWithForname)
      return [];
    
    const parts = dateObj.value.split('.');
    const isoDateString = `${parts[2]}-${parts[1]}-${parts[0]}`;
    const chosenDate = new Date(isoDateString)
    console.log(chosenDate.getDay())
    if (chosenDate.getDay() % 6 === 0 || isHoliday(chosenDate, 'BW')){
      return [];
    }

    let cellWithDate: Excel.Cell = worksheet.getCell('A1')
    const rowNumber = parseInt(cellWithName.row)
    const rows = worksheet.getRow(rowNumber)
    const cellCount = rows.cellCount

    for (let index = 1; index <= cellCount; index++) {
      const text = rows.getCell(index).value?.toString()
      if (!text)
        return [];
      const date = new Date(text)

      if (date.toLocaleString('de-DE', dateOptions) === dateObj.value)
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
  }
  return people
});


function handleModeratorenlist (file: File) {

  const reader = new FileReader();

  reader.onload = () => {
    const arrayBuffer = reader.result as ArrayBuffer;
    const uint8Array = new Uint8Array(arrayBuffer);
    workbookModeratoren.value = new Excel.Workbook();
    workbookModeratoren.value.xlsx.load(uint8Array).then(() => {
      console.log('Datei eingelesen:', workbookModeratoren.value);

      if (workbookModeratoren.value === undefined)
        return;
      
      const worksheet = workbookModeratoren.value.getWorksheet(1);
      const rows = worksheet.getRows(9, 17);

      if (rows === undefined)
        return;

      const moderators: Moderatoren[] = rows.map((row) => {
        const date = new Date(getCellValue(row, 7))
        const datestring = date.toLocaleDateString('de-DE', dateOptions)
        return {
          date: datestring,
          moderator1: getCellValue(row, 8),
          moderator2: getCellValue(row, 9),
        };
      });


      console.log(moderators);
      moderatoren.value = countModerators(moderators)

      const keys = Object.keys(worksheet.getColumn(5).values);
      for(const key of keys){
        const forname = worksheet.getCell(key, 2).value?.toString()
        const name = worksheet.getCell(key, 1).value?.toString()

        if (forname === undefined || name === undefined)
          continue

        bachelorModeratoren.value.push(forname.concat(' ', name))
      }

      // if(group === 'Bachelorstudenten auslassen')
      // moderatoren.value = moderatoren.value.filter(moderator => bachelorStudents.includes(moderator.moderator));

      
    }).catch((error) => {
      console.error('Fehler beim Einlesen der Datei:', error);
    });
  };

  reader.readAsArrayBuffer(file);

}


const highestMod = computed(() => {
  return moderatoren.value.sort((a, b) => b.amount - a.amount)[0].amount
})

const filterPeople = computed(() => {
  if (getPeople.value.length === 0 || moderatoren.value.length === 0)
  return [];

  let filteredPeople = getPeople.value;
  let moderatorNamen: string[] = moderatoren.value.map(moderator => moderator.moderator);

  // Alle bachelorstudenten entfernen:
  if (group.value === 'Bachelorstudenten auslassen')
  filteredPeople = filteredPeople.filter(person => !bachelorModeratoren.value.some((_moderator: string) => _moderator === person));

  // Alle bereits moderierten Namen entfernen
  filteredPeople = filteredPeople.filter(person => !moderatorNamen.some((_moderator: string) => _moderator === person));

  // Only one flag so it's sure this last person gets chosen
  let only_one = ''
  if (filteredPeople.length < 2)
  {
    if (filteredPeople.length === 1)
      only_one = filteredPeople[0]


    for (let presentations = 2; presentations <= highestMod.value; presentations++)
    {
      const moderatorNamen: string[] = moderatoren.value.filter(moderator => moderator.amount < presentations).map(moderator => moderator.moderator);
      // filteredPeople = filteredPeople.filter(person => !moderatorNamen.some((_moderator: string) => _moderator === person));
      filteredPeople = filteredPeople.concat(moderatorNamen)
      if (filteredPeople.length > 1)
        break;
    }
  }

  const returnlist = filteredPeople.slice()

  if (only_one !== '')
  {
    mod1.value = only_one
    filteredPeople.splice(filteredPeople.findIndex(person => person === only_one), 1)
  } else
  {
    const index1 = Math.floor(Math.random() * filteredPeople.length);
    mod1.value = filteredPeople[index1]
    filteredPeople.splice(index1)
  }

  mod2.value = filteredPeople[Math.floor(Math.random() * filteredPeople.length)]

  return returnlist;
})
</script>

<template>
  <main>
    <h2 style="margin-bottom: 6px;">Moderatoren</h2>
    <div class="presenters">
      <PresenterCard title="Moderator 1" :text="mod1" :seconds="Number(2.5)" :mods="filterPeople" @text="mod1 = $event" style="width: 47.5%; height: 75px"></PresenterCard>
      <PresenterCard title="Moderator 2" :text="mod2" :seconds="Number(5.0)" :mods="filterPeople" @text="mod2 = $event" style="width: 47.5%; height: 75px"></PresenterCard>
    </div>
    <h2>Dateiauswahl</h2>
    <div class="file-inputs">
      <FileUpload headerText="Anwesenheitsplan auswählen" :type = "excelFileType" @file-selected="handleFileSelected" class="fileupload"/>
      <FileUpload  headerText="Moderatorenplan auswählen" :type = "excelFileType" @file-selected="handleModeratorenlist" class="fileupload"/>
    </div>
    <h2>Termin</h2>
    <DateInput label="Azubirundentermin eingeben" @date-selected="newdate"/>
    <!-- <p>{{ dateObj }}</p> -->
    <h2>Vorbereitungszeit</h2>
    <NumbersInput :value="prepareTime" @number-selected="prepareTime=$event"/>
    <h2>Gruppeneinschränkungen</h2>
    <RadioButtonInput :options="ops" :selected="selectedOps" @option-selected="group=$event"/>
    
    <p v-show="false">{{ filterPeople.length }}</p>
    
    <div class="details">
      <div class="present-list">
        <h2 v-if="getPeople.length">Verfügbare Personen</h2>
        <ol>
          <li v-for="name in getPeople" :key="name">{{ name }}</li>
        </ol>
      </div>
      <div class="present-list">
        <h2 v-if="moderatoren.length" class="modlistheader">Bisherige Moderatoren</h2>
        <Table v-if="moderatoren.length" :data="moderatoren" :headers="['Moderator', 'Vorträge']" class="modtable"/>
      </div>
    </div>
    
  </main>
</template>

<style scoped>
main{
  margin-top: 16px;
}

.presenters{
  display: flex;
  flex-direction: row;
  gap: 5%;
  margin-bottom: 10px;
}

.file-inputs{
  display: flex;
  flex-direction: row;
  gap: 5%;
}

.fileupload{
  width: 47.5%;
}

.modtable {
  width: 85%;
  margin-inline: auto;
}

.modlistheader {
  margin-top: 20px;
  margin-bottom: 10px;
}

@media (min-width: 1024px) {

  main {
    margin-block: 64px;
  }
  .details{
    display: flex;
    flex-direction: row;
    gap: 5%
  }

  .present-list{
    width: 100%;
  }

  .modtable {
    width: 100%;
    margin: 0;
  }

  .modlistheader {
    margin-top: 0;
  }
} 
</style>
