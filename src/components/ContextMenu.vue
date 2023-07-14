<template>
  <div class="context-menu" :style="`top: data.top + 'px'; left: data.left + 'px'`" ref="context" tabindex="0" @blur="close">
    <ul>
      <li v-for="(menuitem, index) in props.menuItems" :key="index" @click="menuItemClicked(menuitem)">{{ menuitem }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  menuItems: string[],
  top: number,
  left: number
}>();

const emit = defineEmits(['close', 'menu-click']);


const close = () => {
  emit('close');
};

const menuItemClicked = (item: string) => {
  emit('menu-click', item);
};

const handleClickOutsideOfContextMenu = (event: MouseEvent) => {
  const contextMenu = document.querySelector('.context-menu');
  console.log(event)
  if (contextMenu && (!between(event.y, props.top, props.top + 300) || !between(event.x, props.left, props.left+150))) {
    close();
  }

};

function between(x: Number, min:Number, max:Number) {
  return x >= min && x <= max;
}
  
// Event Listener hinzufügen, um das Kontextmenü zu schließen, wenn außerhalb davon geklickt wird
onMounted(() => {
  document.addEventListener('click', handleClickOutsideOfContextMenu);
});

// Event Listener entfernen, wenn das Komponenteninstanz zerstört wird
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideOfContextMenu);
});
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: white;
  height: 300px !important;
  width: 150px !important;
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
