<template>
    <table class="fancy-table">
      <thead>
        <tr>
          <th v-for="header in props.headers" :key="header">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in props.data" :key="index">
          <td v-for="(value, key) in item" :key="key">{{ value }}</td>
        </tr>
      </tbody>
    </table>
  </template>
  
  <script setup lang="ts">
  import type { Moderator } from '@/types/Moderatorenliste';
import { defineProps } from 'vue';

  const props = defineProps<{
    data: Moderator[]
    headers: string[]
  }>()


  </script>
  
  <style scoped>
.fancy-table {
  border-collapse: collapse;
  width: 100%;
}

.fancy-table thead th {
  background-color: #f2f2f2;
  color: #333;
  font-weight: bold;
  padding: 10px;
  text-align: left;
}

.fancy-table tbody td {
  padding: 10px;
}

.fancy-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
  color: #333;
}

.fancy-table tbody tr:hover {
  background-color: steelblue;
  color: #333;
}
</style>