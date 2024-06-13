<script setup lang="ts">
import { computed } from 'vue'
import AppBadge from './AppBadge.vue'
import AppCard from './AppCard.vue'
import { Properties } from '../types/file.type'
import { propertiesColorMap } from '../utils/property-color'

const props = defineProps<{
    properties: Properties
    name: string
    description?: string
    requires?: string
    mode?: 'partial' | 'full'
}>()

function transformProperty(properties: Properties) {
    return {
        ...(properties?.props && {
            props: { text: `${properties?.props.length} props`, classes: propertiesColorMap['props'] },
        }),
        ...(properties?.slots && {
            slots: { text: `${properties?.slots.length} slots`, classes: propertiesColorMap['slots'] },
        }),
        ...(properties?.events && {
            events: { text: `${properties?.events.length} emits`, classes: propertiesColorMap['events'] },
        }),
    }
}

const propertyCollection = computed(() => transformProperty(props.properties))
</script>

<template>
    <AppCard
        class="flex cursor-pointer flex-col justify-between !p-4"
        :class="[mode === 'full' ? '!h-[200px]' : '!h-[130px]']"
    >
        <div class="flex flex-col">
            <h4 class="mb-2 inline-block text-lg font-bold">{{ name }}</h4>
            <div v-if="description" class="line-clamp-2 text-sm font-light">
                {{ description }}
            </div>
        </div>

        <div v-if="requires" class="mt-4 w-full text-sm">Richiede: {{ requires }}</div>

        <div class="mt-4 flex flex-wrap items-center gap-2" v-if="mode === 'full'">
            <AppBadge v-for="property in propertyCollection" :class="property.classes" class="!text-sm">
                {{ property.text }}
            </AppBadge>
        </div>
    </AppCard>
</template>
