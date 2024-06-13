<script setup lang="ts">
import { computed, ref } from 'vue'
// @ts-ignore
import AppFileBox from '../components/AppFileBox.vue'
import { useFileStore } from '../store/file.store.js'
import { storeToRefs } from 'pinia'
import AppSidebar from '../components/AppSidebar.vue'
import AppFileProperties from '../components/AppFileProperties.vue'
import AppFileHeader from '../components/AppFileHeader.vue'
import AppSourceCode from '../components/AppSourceCode.vue'
import AppThemeSwitch from '../components/AppThemeSwitch.vue'
import AppFormText from '../components/AppFormText.vue'

const fileStore = useFileStore()
const { files } = storeToRefs(fileStore)

const searchTerm = ref('')

const _mapFiles = (files) =>
    files &&
    files.map((file: any) => ({
        ...file,
        ...{ properties: { slots: file?.slots, props: file?.props, events: file?.events } },
    }))

const fileCollection = computed(() => {
    const lowerCaseSearchTerm = searchTerm.value.toLowerCase()

    if (lowerCaseSearchTerm === '') return _mapFiles(files.value)

    return _mapFiles(
        files.value.filter((item) => {
            return (
                (item.name && item.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (item.description && item.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (item.requires && item.requires.toLowerCase().includes(lowerCaseSearchTerm))
            )
        }),
    )
})

const columns = computed(() => {
    let otherCol = [{ name: 'Altro', key: 'other' }]
    let statutes = [...new Set(files.value.map((item) => item.status).filter((status) => status !== undefined))]

    if (statutes && statutes.length > 0) {
        statutes = statutes.map((item) => ({
            name: item,
            key: item,
        }))
        statutes = [...statutes, ...otherCol]
        return statutes
    }

    return otherCol
})

function filterFilesByStatus(collection, status) {
    return collection.filter((item) => (status === 'other' ? !item?.status : item?.status === status))
}

const gridMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
}

const current_file = ref(null)

const openFile = (file: any) => (current_file.value = file)

const mode = ref('full')
</script>

<template>
    <div class="flex">
        <div class="flex flex-col">
            <div class="flex items-center">
                <div>
                    <span @click.prevent="mode = 'full'">Estesa</span>
                    <span @click.prevent="mode = 'partial'">Compatta</span>
                </div>

                <div class="mx-4">
                    <AppFormText placeholder="Ricerca componenti" v-model="searchTerm" />
                </div>

                <AppThemeSwitch class="ml-[10px]" />
            </div>

            <div
                class="mt-10 grid w-full gap-4"
                :class="[gridMap[columns.length] !== undefined ? gridMap[columns.length] : gridMap[4]]"
            >
                <div class="bg-bodyGrid h-[calc(100vh-100px)] rounded-xl px-2 py-1" v-for="column in columns">
                    <div class="ml-2 mt-2">
                        <span class="text-bodyText font-medium uppercase">
                            {{ column.name }}
                        </span>
                    </div>
                    <div class="flex flex-col">
                        <AppFileBox
                            v-for="(file, fileKey) in filterFilesByStatus(fileCollection, column.key)"
                            :key="fileKey"
                            :name="file?.name"
                            :description="file?.description"
                            :properties="file?.properties"
                            :requires="file?.requires"
                            :mode="mode"
                            @click.prevent="() => openFile(file)"
                        />
                    </div>
                </div>
            </div>
        </div>

        <AppSidebar direction="right" class="ml-[20px] w-full lg:!relative lg:!h-screen lg:w-[50%]" v-if="current_file">
            <div class="flex flex-col">
                <div class="flex items-center justify-between">
                    <AppFileHeader v-bind="current_file" />
                    <span class="cursor-pointer" @click.prevent="current_file = null">X</span>
                </div>

                <AppSourceCode v-if="current_file?.sourceCode" :source="current_file.sourceCode" />
            </div>

            <div class="mt-4 flex flex-col gap-y-2">
                <AppFileProperties v-if="current_file?.props" label="props" :properties="current_file?.props" />
                <AppFileProperties v-if="current_file?.slots" label="slots" :properties="current_file?.slots" />
                <AppFileProperties v-if="current_file?.events" label="emits" :properties="current_file?.events" />
                <AppFileProperties v-if="current_file?.methods" label="methods" :properties="current_file?.methods" />
            </div>
        </AppSidebar>
    </div>
</template>
