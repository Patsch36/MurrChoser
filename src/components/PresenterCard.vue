<template>
    <div class="presenter-card" :title="props.title">
        <div>
            <p>{{ text }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from 'vue';

const props = defineProps<{
  title: string,
  text: any,
  seconds?: number
}>()

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
    if (newText !== undefined) {
        let limit = 30;

        counter = 0;

        if (props.seconds)
            limit = props.seconds * 20;

        fireAnimation(limit)
    }
});
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