<script setup lang="ts">
import AppFileHeader from '../components/AppFileHeader.vue'
import AppSourceCode from '../components/AppSourceCode.vue'
import AppFileProperties from '../components/AppFileProperties.vue'
import { useFileStore } from '../store/file.store'
import { useRoute } from 'vue-router'
import { watch, ref, onMounted } from 'vue'

const route = useRoute()

const fileStore = useFileStore()
const current_file = ref(null)

function initFile(id) {
    current_file.value = fileStore.getCurrentFile(id)
}

watch(
    () => route.params.id,
    (newId, oldId) => {
        initFile(newId)
    },
)

onMounted(() => {
    initFile(route.params.id)
})
</script>

<template>
    <div class="fixed left-[300px] top-0 grid h-full w-[calc(100%-300px)] grid-cols-3 gap-4 bg-gray-50 p-4">
        <AppFileHeader v-bind="current_file" />

        <div class="col-span-2 bg-white px-4">
            <div class="mt-4 flex flex-col gap-y-2">
                <AppFileProperties v-if="current_file?.props" label="props" :properties="current_file?.props" />
                <AppFileProperties v-if="current_file?.slots" label="slots" :properties="current_file?.slots" />
                <AppFileProperties v-if="current_file?.events" label="emits" :properties="current_file?.events" />
                <AppFileProperties v-if="current_file?.methods" label="methods" :properties="current_file?.methods" />
            </div>
        </div>

        <AppSourceCode v-if="current_file?.sourceCode" :source="current_file.sourceCode" />
    </div>
</template>
