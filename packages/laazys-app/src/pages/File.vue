<script setup lang="ts">
import AppFileHeader from '../components/AppFileHeader.vue'
import AppSourceCode from '../components/AppSourceCode.vue'
import AppFileProperties from '../components/AppFileProperties.vue'
import AppComponentPreview from '../components/AppComponentPreview.vue'
import AppFigma from '../components/AppFigma.vue'
//@ts-ignore
import { useFileStore } from '../store/file.store'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { File } from '../types/file.type'

const route = useRoute()
const fileStore = useFileStore()
const { preview, revision } = storeToRefs(fileStore)

// getCurrentFile reads the store's files, so this follows both navigation and watch-mode reloads
const current_file = computed<File | null>(() => fileStore.getCurrentFile(route.params.id))
</script>

<template>
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AppFileHeader v-if="current_file" v-bind="current_file" class="lg:col-span-3" />

        <AppComponentPreview
            v-if="current_file?.extension === 'vue'"
            :file-id="current_file.id"
            :status="preview"
            :revision="revision"
            class="lg:col-span-3"
        />

        <div class="rounded-2xl border bg-surface p-4 lg:col-span-2">
            <div class="flex flex-col gap-y-2">
                <AppFileProperties v-if="current_file?.props" label="props" :properties="current_file?.props" />
                <AppFileProperties v-if="current_file?.slots" label="slots" :properties="current_file?.slots" />
                <AppFileProperties v-if="current_file?.events" label="emits" :properties="current_file?.events" />
                <AppFileProperties v-if="current_file?.methods" label="methods" :properties="current_file?.methods" />
            </div>
        </div>

        <AppSourceCode v-if="current_file?.sourceCode" :source="current_file.sourceCode" />

        <AppFigma v-if="current_file?.figma" :url="current_file.figma" class="lg:col-span-3" />
    </div>
</template>
