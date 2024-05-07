<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFileStore } from '../store/file.store.js'
import { storeToRefs } from 'pinia'
import AppList from './AppList.vue'

interface Props {
    files?: []
}

const props = withDefaults(defineProps<Props>(), {
    files: () => [],
})

const router = useRouter()
const fileStore = useFileStore()
const { current_file } = storeToRefs(fileStore)

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
