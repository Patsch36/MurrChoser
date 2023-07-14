<template>
    <div class="presenter-card" :title="props.title" @click="openContextMenu">
        <div>
            <p>{{ text }}</p>
        </div>
        
        <context-menu
      :menu-items="mods.sort()"
      v-show="isContextMenuOpen"
      :style="{ top: `${contextMenuTop}px`, left: `${contextMenuLeft}px` }"
      :top="contextMenuTop" :left="contextMenuLeft"
      @close="closeContextMenu"
      @menu-click="handleMenuItemClick"
    ></context-menu>
    
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ContextMenu from './ContextMenu.vue';


const isContextMenuOpen = ref(false);
const contextMenuLeft = ref(0);
const contextMenuTop = ref(0);


const props = defineProps<{
  title: string,
  text: any,
  seconds?: number,
  mods: string[]
}>()

const emit = defineEmits(['text']);

const text = ref<string>();
let counter = 0;

function replaceWithRandomLetters(input: string): string {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char !== ' ')
    {
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        result += randomLetter;
    } else
        result += ' '
  }

  return result;
}

const fireAnimation = (limit: number) => {
    text.value = replaceWithRandomLetters(props.text)

    let intervalID = setInterval(() => {
        if (counter === limit){
            text.value = props.text;
            // Clear interval so they never stack
            clearInterval(intervalID)
            return
        }
        counter ++;

        if(text.value === undefined)
            return;

        text.value = replaceWithRandomLetters(text.value)

    }, 50)
}

watch(() => props.text, (newText:any) => {
    counter = 0;

    // console.log("Presentercard", props.mods)

    if (newText !== undefined) {
        let limit = 30;

        if (props.seconds)
            limit = props.seconds * 20;

        fireAnimation(limit)
    }
});


const openContextMenu = (event: MouseEvent) => {
  event.preventDefault();

  if (!isContextMenuOpen.value)
  {
    isContextMenuOpen.value = true;
    contextMenuTop.value = event.clientY + 150 > window.innerHeight ? event.clientY - 150 : event.clientY;
    contextMenuLeft.value = event.clientX + 150 > window.innerWidth ? event.clientX - 150 : event.clientX;
  } else {
    closeContextMenu();
  }
};

const closeContextMenu = () => {
  if (isContextMenuOpen.value){
    isContextMenuOpen.value = false;
  }
};

const handleMenuItemClick = (item: string) => {
  text.value = item;
  emit('text', item)
};
</script>

<style scoped>
.presenter-card{
    border: 1px solid var(--color-border-light);
    border-radius: 3px;
    position: relative;
}

.presenter-card::after {
    content: attr(title);
    position: absolute;
    background-color: var(--color-background);
    transform: translate(25%, -350%);
}

.presenter-card div {
    height: calc(100% - 20px);
    margin-block: 10px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}

.presenter-card div p{
    font-size: 1.75rem;
    opacity: 0.8;
}

</style>