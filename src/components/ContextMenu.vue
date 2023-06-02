<template>
  <div class="context-menu" :style="`top: data.top + 'px'; left: data.left + 'px'`" ref="context" tabindex="0" @blur="close">
    <ul>
      <li v-for="(menuitem, index) in props.menuItems" :key="index" @click="menuItemClicked(menuitem)">{{ menuitem }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { reactive, defineEmits } from 'vue';

const props = defineProps<{
  menuItems: string[]
}>();

const emit = defineEmits(['close', 'menu-click']);

// const data = reactive({
//   left: 0,
//   top: 0,
//   show: false,
// });

const close = () => {
  // data.show = false;
  // data.left = 0;
  // data.top = 0;
  emit('close');
};

const menuItemClicked = (item: string) => {
  // close();
  // console.log(data.show, item)
  emit('menu-click', item);
};
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: white;
  height: 300px !important;
  overflow-y: auto;
  color: black;
  z-index: 999;
  outline: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  cursor: pointer;
}

ul {
  list-style: none;
  padding:0;
  margin: 0;
  margin-top: 50px;
}

li {
  padding: 8px 12px;
  cursor: pointer;
}

li:hover {
  background-color: #f0f0f0;
}
</style>
