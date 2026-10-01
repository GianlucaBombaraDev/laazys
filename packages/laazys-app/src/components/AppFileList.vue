<script setup lang="ts">
import { computed } from 'vue'
import AppList from './AppList.vue'
import type { File } from '../types/file.type'

interface Props {
    files?: File[]
}

const props = withDefaults(defineProps<Props>(), {
    files: () => [],
})

const componentList = computed<any>(() => mapFiles(props.files.filter((file) => file.extension === 'vue')))

// .js and .ts composables
const composableList = computed<any>(() => mapFiles(props.files.filter((file) => file.extension !== 'vue')))

function mapFiles(files: any) {
    return files.map((file: any) => ({
        extension: file.extension,
        name: file.name,
        id: file.id,
        status: file.status,
    }))
}
</script>

<template>
    <div class="flex flex-col">
        <AppList title="Componenti" :items="componentList" />
        <AppList title="Composable" :items="composableList" />
    </div>
</template>
