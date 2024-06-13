<script setup lang="ts">
import { onMounted } from 'vue'
import laazysLogo from '/laazys-logo.svg'
import AppSidebar from './components/AppSidebar.vue'
import { useRouter } from 'vue-router'
import AppFileList from './components/AppFileList.vue'
import { useFiles } from './composable/useFiles'
//@ts-ignore
import { useFileStore } from './store/file.store.js'
import { storeToRefs } from 'pinia'

const router = useRouter()
const { getFiles } = useFiles()
const fileStore = useFileStore()
const { files } = storeToRefs(fileStore)

onMounted(async () => {
    files.value = await getFiles()
})

const backToHome = () => router.push('/')
</script>

<template>
    <AppSidebar direction="left" class="w-[300px]">
        <div class="flex flex-col items-center justify-center">
            <img :src="laazysLogo" alt="laazys logo" class="w-[200px]" @click.prevent="backToHome" />
        </div>

        <div v-if="files" class="mt-[30px]">
            <AppFileList :files="files" />
        </div>
    </AppSidebar>

    <div v-if="files" class="bg-body fixed left-[300px] top-0 h-full w-[calc(100%-300px)] p-4">
        <router-view></router-view>
    </div>
</template>
