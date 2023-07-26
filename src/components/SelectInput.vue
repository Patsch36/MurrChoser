<template>
    <div class="wrapper">
        <select class="custom-select-input" @change="handleSelectChange">
            <option v-for="item in props.options" :value="item">{{ item }}</option>
        </select>
    </div>
</template>
  
<script lang="ts" setup>

const props = defineProps<{
  options: string[]
}>()

const emit = defineEmits(['worksheet-selected'])

const handleSelectChange = ({ target }: Event) => {
  const { value } = target as HTMLSelectElement;
  emit('worksheet-selected', value);
};

</script>
  
  <style scoped>
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 50px;
    display: flex;
    justify-content: center;
  }
  
  .custom-select-input {
    width: auto;
    background-color: var(--color-background);
    color: var(--color-border-light);
    border: 1px solid var(--color-border-light);
    border-radius: 3px;
    padding: 8px 10px;
    cursor: pointer;
  }
  </style>
  