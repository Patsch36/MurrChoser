<template>
  <input type="text" v-model="search" placeholder="Search..." class="searchbar">
  <div>
    <table class="fancy-table">
      <thead>
        <tr>
          <th v-for="header in props.headers" :key="header">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in filteredData" :key="index">
          <td v-for="(value, key) in item" :key="key">{{ value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Moderator } from '@/types/Moderatorenliste';
import { ref, computed } from 'vue';

const props = defineProps<{
  data: Moderator[]
  headers: string[]
}>()

const search = ref('');

const filteredData = computed(() => {
  if (!search.value) {
    return props.data;
  }
  return props.data.filter((item) => {
    return Object.values(item).some((value) => {
      return String(value).toLowerCase().includes(search.value.toLowerCase());
    });
  });
});

</script>

<style scoped>

.searchbar{
  box-sizing: border-box;
  width: 100%;
  margin: 8px 0 16px 0;
  padding: 8px 10px;
  border: 2px solid #ccc;
  background-color: var(--color-background);
  color: var(--color-border-light);
  border: 1px solid var(--color-border-light);
  border-radius: 3px;
  cursor: pointer;
}

.fancy-table {
  border-collapse: collapse;
  width: 100%;
}

.fancy-table thead th {
  background-color: #d4d4d4;
  color: #333;
  font-weight: bold;
  padding: 10px;
  text-align: left;
}

.fancy-table tbody td {
  padding: 10px;
}

.fancy-table tbody tr:nth-child(even) {
  background-color: #d4d4d4;
  color: #333;
}

.fancy-table tbody tr:hover {
  background-color: var(--color-primary);;
  color: #333;
}
</style>