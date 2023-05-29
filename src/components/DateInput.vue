<template>
    <div class="datepicker">
      <label v-if="label" for="datepicker" class="datepicker-label">{{ props.label }}: </label>
      <input type="date" id="datepicker" class="datepicker-input" v-model="selectedDate" @change="handleDateChange" />
    </div>
  </template>
  
<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps<{
    label?: string
}>()

const selectedDate = ref<string>('');

const emit = defineEmits(['date-selected'])

const handleDateChange = () => {
  emit('date-selected', selectedDate.value);
}
  </script>
  
  <style scoped>
  .datepicker {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  ::-webkit-calendar-picker-indicator {
    filter: invert(1);
}
  
  .datepicker-label {
    margin-right: 1rem;
    color: var(--color-background-text);
    font-weight: bold;
  }
  
  .datepicker-input {
    padding: 0.5rem;
    border-radius: 4px;
    background-color: var(--color-background);
    color: var(--color-background-text);
    border: 1px solid var(--color-border-light);
  }
  </style>
  