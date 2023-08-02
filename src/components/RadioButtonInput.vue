<template>
  <div class="wrapper">
    <div class="radio-group">
      <label v-for="item in props.options" :key="item" class="radio-label">
        <input type="radio" :value="item" v-model="selectedOption" @change="handleChange" :checked="item === select" class="radio-input">
        {{ item }}
      </label>
    </div>
  </div>
</template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  const props = defineProps<{
    options: string[]
    selected ?: number
  }>()
  const select = props.selected ? props.options[props.selected] : props.options[0]

  const selectedOption = ref<string>('');

  const emit = defineEmits(['option-selected'])
  emit('option-selected', select);

  const handleChange = ({ target }: Event) => {
    const { value } = target as HTMLSelectElement;
    emit('option-selected', value);
  };
  
</script>
  
<style scoped>
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 50px;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  
  .radio-group {
    display: flex;
    flex-direction: row;
    gap: 10px;
  }
  
  .radio-label {
    display: flex;
    align-items: center;
  }
  
  .radio-input {
    margin-right: 5px;
    cursor: pointer;
  }
  
  </style>