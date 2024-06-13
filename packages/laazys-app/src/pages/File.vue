<script setup lang="ts">
import AppFileHeader from '../components/AppFileHeader.vue'
import AppSourceCode from '../components/AppSourceCode.vue'
import AppFileProperties from '../components/AppFileProperties.vue'
//@ts-ignore
import { useFileStore } from '../store/file.store'
import { useRoute } from 'vue-router'
import { watch, ref, onMounted } from 'vue'
import { File } from '../types/file.type'
import AppCard from '../components/AppCard.vue'

const route = useRoute()

const fileStore = useFileStore()
const current_file = ref<File | null>(null)

function initFile(id: string | number) {
    current_file.value = fileStore.getCurrentFile(id)
}

watch(
    () => route.params.id,
    (newId) => {
        //@ts-ignore
        initFile(newId)
    },
)

onMounted(() => {
    //@ts-ignore
    initFile(route.params.id)
})
</script>

<template>
    <div class="fixed left-[300px] top-0 grid h-full w-[calc(100%-300px)] grid-cols-3 gap-4 p-4">
        <div class="flex flex-col">
            <AppCard>
                <AppFileHeader v-bind="current_file" />
            </AppCard>

            <AppSourceCode v-if="current_file?.sourceCode" :source="current_file.sourceCode" />
        </div>

        <AppCard>
            <div class="mt-4 flex flex-col gap-y-2">
                <AppFileProperties v-if="current_file?.props" label="props" :properties="current_file?.props" />
                <AppFileProperties v-if="current_file?.slots" label="slots" :properties="current_file?.slots" />
                <AppFileProperties v-if="current_file?.events" label="emits" :properties="current_file?.events" />
                <AppFileProperties v-if="current_file?.methods" label="methods" :properties="current_file?.methods" />
            </div>
        </AppCard>
    </div>
</template>
