<script setup lang="ts">

// TODO: Add a way to select the amount of time a presenter has to prepare
// TODO: Figure out how to make handler reactive and without ref-variables

import FileUpload from '@/components/FileUpload.vue'
import { ref } from 'vue';
import RadioButtonInput from '@/components/RadioButtonInput.vue';
import Table from '@/components/Table.vue';
import DateInput from '@/components/DateInput.vue';
import PresenterCard from '@/components/PresenterCard.vue';
import NumbersInput from '@/components/NumbersInput.vue';
import DataHandler from '@/functions/dataHandler';

const excelFileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

const ops: string[] = ['Alle Azubis / Studenten', 'Bachelorstudenten auslassen']
const ops2: string[] = ['Mit 1. Lehrjahr', 'Ohne 1. Lehrjahr']
const selectedOps = 1;


const handler = new DataHandler();
</script>

<template>
  <main>
    <h2 style="margin-bottom: 6px;">Moderatoren</h2>
    <div class="presenters">
      <PresenterCard title="Moderator 1" :text="handler.mod1.value" :seconds="Number(2.5)" :mods="handler.modlistForMod([handler.mod1.value, handler.mod2.value])" @text="handler.mod1.value = $event" style="width: 47.5%; height: 75px"></PresenterCard>
      <PresenterCard title="Moderator 2" :text="handler.mod2.value" :seconds="Number(5.0)" :mods="handler.modlistForMod([handler.mod1.value, handler.mod2.value])" @text="handler.mod2.value = $event" style="width: 47.5%; height: 75px"></PresenterCard>
    </div>
    <h2>Dateiauswahl</h2>
    <div class="file-inputs">
      <FileUpload headerText="Anwesenheitsplan auswählen" :type = "excelFileType" @file-selected="handler.handleFileSelected" class="fileupload"/>
      <FileUpload  headerText="Moderatorenplan auswählen" :type = "excelFileType" @file-selected="handler.handleModeratorenlist" class="fileupload"/>
    </div>
    <h2>Termin</h2>
    <DateInput label="Azubirundentermin eingeben" @date-selected="handler.newdate"/>
    <!-- <p>{{ handler.dateObj }}</p> -->
    <div>
      <h2>Vorbereitungszeit</h2>
      <div style="display: flex; flex-direction: row; justiofy-content: center;">
        <NumbersInput :value="handler.prepareTime.value" @number-selected="handler.prepareTime.value=$event" style="margin-right: 32px"/>
        <NumbersInput label="Maximale Fehltage in Vorbereitungszeit" :value="handler.missesInPrepareTime.value" @number-selected="handler.missesInPrepareTime.value=$event"/>
      </div>
    </div>
    <div>
      <h2>Zeitraum danach ohne Prüfung</h2>
      <div style="display: flex; flex-direction: row; justiofy-content: center;">
        <NumbersInput :value="handler.afterTime.value" @number-selected="handler.afterTime.value=$event" style="margin-right: 32px"/>
      </div>
    </div>
    
    <h2>Gruppeneinschränkungen</h2>
    <RadioButtonInput :options="ops" :selected="selectedOps" @option-selected="handler.group.value=$event"/>
    
    <h2>Erstes Lehrjahr filtern</h2>
    <RadioButtonInput :options="ops2" :selected="selectedOps" @option-selected="handler.group2.value=$event"/>
    
    <div class="details">
      <div class="present-list">
        <h2 v-if="handler.getPeople.value.length">Verfügbare Personen</h2>
        <ol>
          <li v-for="name in handler.getPeople.value" :key="name">{{ name }}</li>
        </ol>
      </div>
      <div class="present-list">
        <h2 v-if="handler.moderatoren.value.length" class="modlistheader">Bisherige Moderatoren</h2>
        <Table v-if="handler.moderatoren.value.length" :data="handler.moderatoren.value" :headers="['Moderator', 'Vorträge']" class="modtable"/>
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

@media (min-width: 1100px) {

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
