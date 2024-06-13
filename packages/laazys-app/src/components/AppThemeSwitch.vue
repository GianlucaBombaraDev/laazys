<script setup lang="ts">
/**
 * Manage the switch light/dark mode
 */
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'

const currentTheme = ref('light')

/**
 * Toggle light/dark theme classs to body
 */
function toggleTheme(themeKey: string) {
    currentTheme.value = themeKey

    if (currentTheme.value === 'dark') {
        document.querySelector('body')?.classList.add('dark-theme')
    } else {
        document.querySelector('body')?.classList.remove('dark-theme')
    }
}

const themes: { light: { classes: string }; dark: { classes: string } } = {
    light: {
        classes: 'bg-accent hover:bg-primary',
    },
    dark: {
        classes: 'bg-accent hover:bg-primary',
    },
}
</script>

<template>
    <div class="flex items-center justify-center">
        <div
            v-for="(theme, themeKey) in themes"
            :key="themeKey"
            class="r-[5px] flex cursor-pointer items-center justify-center rounded-full p-1 first:mr-[5px]"
            :class="[themeKey === currentTheme ? theme.classes : '']"
            @click.prevent="toggleTheme(themeKey)"
        >
            <AppIcon
                :name="themeKey === 'light' ? 'sun' : 'moon'"
                :sizing="{ width: 'w-[20px]', height: 'h-[20px]' }"
            />
        </div>
    </div>
</template>
