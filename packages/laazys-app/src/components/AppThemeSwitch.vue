<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { getInitialDark, saveTheme, setDarkClass } from '../composable/useTheme'

const isDarkMode = ref(getInitialDark())
// Apply the initial theme without saving it, so the system preference keeps applying
setDarkClass(isDarkMode.value)

function setTheme(dark: boolean) {
    isDarkMode.value = dark
    setDarkClass(dark)
    saveTheme(dark)
}

const themes = [
    { dark: false, icon: 'sun', label: 'Tema chiaro' },
    { dark: true, icon: 'moon', label: 'Tema scuro' },
]
</script>

<template>
    <div class="flex items-center gap-[5px]">
        <button
            v-for="theme in themes"
            :key="theme.icon"
            type="button"
            class="flex cursor-pointer items-center justify-center rounded-full p-1"
            :class="isDarkMode === theme.dark ? 'bg-accent hover:bg-primary' : ''"
            :aria-label="theme.label"
            :aria-pressed="isDarkMode === theme.dark"
            @click="setTheme(theme.dark)"
        >
            <AppIcon :name="theme.icon" :sizing="{ width: 'w-[20px]', height: 'h-[20px]' }" />
        </button>
    </div>
</template>
