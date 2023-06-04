<template>
    <div class="numbers-input">
      <label v-if="label" for="numbers-input" class="numbers-input-label">{{ props.label }}: </label>
      <input type="number" id="numbers-input" v-model="selectedNumber" class="numbers-input-field" @change="handleNumberChange" @keydown.up.prevent="incrementNumber" @keydown.down.prevent="decrementNumber"/>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue';
  
  const props = defineProps<{
    label?: string
    value: number
  }>()
  
  const selectedNumber = ref<number>(props.value);
  
  const emit = defineEmits(['number-selected'])
  
  const handleNumberChange = () => {
    emit('number-selected', selectedNumber.value);
  }
  
  const incrementNumber = () => {
    selectedNumber.value++;
  }
  
  const decrementNumber = () => {
    selectedNumber.value--;
  }
  </script>
  
  <style scoped>
.numbers-input {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}
  
::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
    margin: 0;
    filter: invert(1);
}
  
.numbers-input-label {
    margin-right: 1rem;
    color: var(--color-background-text);
    font-weight: bold;
}
  
.numbers-input-field {
    padding: 0.5rem;
    border-radius: 4px;
    background-color: var(--color-background);
    color: var(--color-background-text);
    border: 1px solid var(--color-border-light);
    position: relative;
}
</style>
  