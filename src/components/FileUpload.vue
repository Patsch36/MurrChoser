<template>
    <div class="wrapper">
        <!-- <p>Datei auswählen</p> -->
        <input class="custom-file-input" type="file" title="Datei wählen" :content="props.headerText">
    </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';

const props = defineProps<{
  headerText: String
}>()

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
  /* position: relative; */
  isolation: isolate;
}

.custom-file-input::after{
    /* content: 'Datei auswählen'; */
    content: attr(content);
    position: absolute;
    display: block;
    background-color: var(--color-background);
    font-size: .75rem;
    /* background-color: steelblue; */
    /* top: -10px;
    left: 10px; */
    /* z-index: 1; */
    transform: translate(.25rem, -1.95rem);
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
.custom-file-input:hover::before {
  border-color: transparent;
}
.custom-file-input:active::before {
  background: -webkit-linear-gradient(top, #e3e3e3, #f9f9f9);
}

</style>
