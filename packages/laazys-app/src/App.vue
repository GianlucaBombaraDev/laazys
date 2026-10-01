<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import laazysLogo from '/laazys-logo.svg'
import AppSidebar from './components/AppSidebar.vue'
import AppThemeSwitch from './components/AppThemeSwitch.vue'
import AppSearch from './components/AppSearch.vue'
import { useRoute, useRouter } from 'vue-router'
import AppFileList from './components/AppFileList.vue'
import { useFiles } from './composable/useFiles'
import { applyCustomTheme } from './composable/useTheme'
import { searchFiles } from './utils/search'
//@ts-ignore
import { useFileStore } from './store/file.store.js'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const { getFiles, getTheme, getPreviewStatus, onFilesUpdate } = useFiles()
const fileStore = useFileStore()
const { files, preview, revision } = storeToRefs(fileStore)

const query = ref('')
// Only read inside v-if="files", so the list is always loaded here
const filteredFiles = computed(() => searchFiles(files.value, query.value))

// Mobile only: the sidebar is always visible from md up
const sidebarOpen = ref(false)
watch(
    () => route.fullPath,
    () => (sidebarOpen.value = false),
)

// With `laazys --watch` the CLI pushes an event after each regeneration
const stopUpdates = onFilesUpdate(async () => {
    files.value = await getFiles()
    revision.value++
})
onUnmounted(stopUpdates)

onMounted(async () => {
    const [loadedFiles, theme, previewStatus] = await Promise.all([getFiles(), getTheme(), getPreviewStatus()])
    applyCustomTheme(theme)
    preview.value = previewStatus
    files.value = loadedFiles
})

const backToHome = () => router.push('/')
</script>

<template>
    <header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface p-3 md:hidden">
        <img :src="laazysLogo" alt="laazys" class="h-8 cursor-pointer" @click="backToHome" />
        <button
            type="button"
            class="rounded-lg border p-2"
            aria-label="Apri il menu"
            :aria-expanded="sidebarOpen"
            @click="sidebarOpen = !sidebarOpen"
        >
            <svg
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
            >
                <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    </header>

    <div v-if="sidebarOpen" class="fixed inset-0 z-20 bg-black/40 md:hidden" @click="sidebarOpen = false"></div>

    <AppSidebar :open="sidebarOpen">
        <div class="flex items-center justify-between gap-4">
            <img :src="laazysLogo" alt="laazys logo" class="min-w-0 cursor-pointer" @click.prevent="backToHome" />
            <AppThemeSwitch />
        </div>

        <router-link to="/" class="mt-4 block font-semibold text-primary hover:underline">Panoramica</router-link>

        <AppSearch v-model="query" class="mt-4" />

        <div v-if="files" class="mt-4">
            <p v-if="query && !filteredFiles.length" class="text-sm text-muted">Nessun risultato per “{{ query }}”.</p>
            <AppFileList v-else :files="filteredFiles" />
        </div>
    </AppSidebar>

    <main v-if="files" class="min-h-screen p-4 md:ml-[300px]">
        <router-view></router-view>
    </main>
</template>
