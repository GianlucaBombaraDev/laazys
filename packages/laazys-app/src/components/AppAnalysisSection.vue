<script setup lang="ts">
import type { AnalysisItem } from '../utils/analysis'

defineProps<{
    title: string
    items: AnalysisItem[]
    emptyText: string
}>()
</script>

<template>
    <section class="rounded-2xl border bg-surface p-4">
        <h2 class="font-semibold">
            {{ title }} <span class="text-muted">({{ items.length }})</span>
        </h2>

        <ul v-if="items.length" class="mt-2 flex flex-col gap-1">
            <li v-for="(item, index) in items" :key="`${item.id}-${index}`">
                <router-link :to="{ name: 'file', params: { id: item.id } }" class="text-primary hover:underline">
                    {{ item.label }}
                </router-link>
                <span v-if="item.detail" class="text-sm text-muted"> in {{ item.detail }}</span>
            </li>
        </ul>
        <p v-else class="mt-2 text-sm text-muted">{{ emptyText }}</p>
    </section>
</template>
