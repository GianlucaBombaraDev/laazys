<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
//@ts-ignore
import { useFileStore } from '../store/file.store'
import { analyzeFiles } from '../utils/analysis'
import AppAnalysisSection from '../components/AppAnalysisSection.vue'

const { files } = storeToRefs(useFileStore())
const analysis = computed(() => analyzeFiles(files.value ?? []))

const tiles = computed(() => [
    { label: 'Componenti', value: analysis.value.components },
    { label: 'Composable', value: analysis.value.composables },
    { label: 'Deprecati', value: analysis.value.deprecated.length },
    { label: 'Senza descrizione', value: analysis.value.missingDescription.length },
])
</script>

<template>
    <div class="flex flex-col gap-6">
        <h1 class="text-2xl font-bold">Panoramica</h1>

        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div v-for="tile in tiles" :key="tile.label" class="rounded-2xl border bg-surface p-4">
                <p class="text-sm text-muted">{{ tile.label }}</p>
                <p class="text-3xl font-bold">{{ tile.value }}</p>
            </div>
        </div>

        <section class="rounded-2xl border bg-surface p-4">
            <h2 class="font-semibold">Stato dei componenti</h2>
            <ul class="mt-2 flex flex-wrap gap-2">
                <li
                    v-for="(count, status) in analysis.statusCounts"
                    :key="status"
                    class="rounded-full border px-3 py-1 text-sm"
                >
                    {{ status }}: <strong>{{ count }}</strong>
                </li>
            </ul>
        </section>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <AppAnalysisSection
                title="Componenti deprecati"
                :items="analysis.deprecated"
                empty-text="Nessun componente deprecato."
            />
            <AppAnalysisSection
                title="Componenti senza descrizione"
                :items="analysis.missingDescription"
                empty-text="Tutti i componenti hanno una descrizione."
            />
            <AppAnalysisSection
                title="Metodi senza descrizione"
                :items="analysis.undocumentedMethods"
                empty-text="Tutti i metodi hanno una descrizione."
            />
        </div>
    </div>
</template>
