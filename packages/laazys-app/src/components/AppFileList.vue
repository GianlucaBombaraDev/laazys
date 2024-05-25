<script setup lang="ts">
import { computed } from 'vue'
import AppList from './AppList.vue'

type File = {
    extension: string
    name: string
    id:string
    status: string
}

interface Props {
    files?: File[]
}

const props = withDefaults(defineProps<Props>(), {
    files: () => [],
})

const componentList = computed<any>(
    () => props.files && mapFiles(props.files.filter((file) => file.extension === 'vue')),
)

const composableList = computed<any>(
    () => props.files && mapFiles(props.files.filter((file) => file.extension === 'js')),
)

function mapFiles(files: any) {
    return files.map((file: any) => ({
        extension: file.extension,
        name: file.name,
        id: file.id,
        status: file?.status,
    }))
}
</script>

<template>
    <div class="flex flex-col">
        <AppList title="Componenti" :items="componentList" />
        <AppList title="Composable" :items="composableList" />
    </div>
</template>
