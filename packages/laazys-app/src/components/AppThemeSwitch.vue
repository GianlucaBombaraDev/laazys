<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'

const isDarkMode = ref(false)

function toggleTheme() {
    isDarkMode.value = !isDarkMode.value

    if (isDarkMode.value) {
        document.querySelector('body')?.classList.add('dark-theme')
    } else {
        document.querySelector('body')?.classList.remove('dark-theme')
    }
}

function getClasses(step: number) {
    const step2Classes = (isDarkMode.value && step === 2) ?? 'bg-accent hover:bg-primary'
    const step1Classes = (!isDarkMode.value && step === 1) ?? 'bg-accent hover:bg-primary'
    return step2Classes + ' ' + step1Classes
}
</script>

<template>
    <div class="flex items-center">
        <div
            v-for="theme in 2"
            :key="theme"
            class="r-[5px] flex cursor-pointer items-center justify-center rounded-full p-1 first:mr-[5px]"
            :class="[getClasses(theme)]"
            @click.prevent="toggleTheme"
        >
            <AppIcon :name="theme === 1 ? 'sun' : 'moon'" :sizing="{ width: 'w-[20px]', height: 'h-[20px]' }" />
        </div>
    </div>
</template>
