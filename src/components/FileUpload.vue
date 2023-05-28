<template>
    <div class="wrapper">
        <!-- <p>Datei auswählen</p> -->
        <input class="custom-file-input" type="file" :content="props.headerText" :accept ="props.type" @change="handleFileSelect">
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  headerText: String
  type: string
}>()

const emit = defineEmits(['file-selected']); // Event "file-selected" definieren

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    // Eine Datei wurde ausgewählt
    input.classList.add('file-selected');
    
    const file = input.files[0];
    
    // Emit-Event mit dem Dateiobjekt als Payload
    emit('file-selected', file);
    // const file = input.files[0];
    // const reader = new FileReader();

    // reader.onload = () => {
    //   const arrayBuffer = reader.result as ArrayBuffer;
    //   const uint8Array = new Uint8Array(arrayBuffer);
    //   const workbook = new Excel.Workbook();
    //   workbook.xlsx.load(uint8Array).then(() => {
    //     console.log('Datei eingelesen:', workbook);

    //     worksheets = workbook.worksheets.map(elem => elem.name)

    //     const worksheet = workbook.worksheets[0];

    //     console.log(worksheet.getRow(10).values)
    //   }).catch((error) => {
    //     console.error('Fehler beim Einlesen der Datei:', error);
    //   });
    // };

    // reader.readAsArrayBuffer(file);

  } else {
    // Keine Datei ausgewählt
    input.classList.remove('file-selected');
  }
};



</script>

<style>
.wrapper{
    display: flex;
    flex-direction: column;
    height: 50px;
    display: flex;
    justify-content: center;
}

/* .wrapper p {
    width: 120px;
    padding-inline: 10px;
    font-size: 0.75rem;
    transform: translateY(0.4rem) translateX(.5rem);
    background-color: red;
} */

.custom-file-input{
  width: auto;
  border: 1px solid #999;
  border-radius: 3px;
  padding: 8px 10px;
  isolation: isolate;
  cursor: pointer;
}

.custom-file-input::after{
    content: attr(content);
    position: absolute;
    display: block;
    background-color: var(--color-background);
    font-size: .9rem;
    transform: translate(0rem, -1rem);
    transition: transform .5s ease-in-out, font-size .5s ease-in-out;
}

.custom-file-input::-webkit-file-upload-button {
  /* visibility: hidden; */
  display: none;
}
.custom-file-input::before {
  content: 'Select some files';
  display: inline-block;
  background: linear-gradient(top, #f9f9f9, #e3e3e3);
  border: 1px solid #999;
  border-radius: 3px;
  padding: 5px 8px;
  outline: none;
  white-space: nowrap;
  -webkit-user-select: none;
  user-select: none;
  cursor: pointer;
  /* text-shadow: 1px 1px #fff; */
  font-weight: 700;
  font-size: 10pt;
  margin-right: 10px;
  display: none;
}
.custom-file-input:hover::after {
  border-color: transparent;
}
.custom-file-input.file-selected::after,
.custom-file-input:hover::after {
  transform: translate(.25rem, -1.95rem);
  font-size: .75rem;
}
.custom-file-input:active::before {
  background: -webkit-linear-gradient(top, #e3e3e3, #f9f9f9);
}

</style>
