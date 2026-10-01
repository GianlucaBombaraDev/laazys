<script setup lang="ts">
//@ts-ignore
import { useRoute } from 'vue-router'

type Item = {
    id: string
    name: string
    status: string
}

interface Props {
    title: string
    items: Item[]
}

withDefaults(defineProps<Props>(), {
    title: '',
    items: () => [],
})

const route = useRoute()

// Keys are lowercase because getStatus lowercases the @status value
const mapStatus: { [key: string]: string } = {
    deprecated: 'bg-deprecated-bg text-deprecated-text',
    alpha: 'bg-alpha-bg text-alpha-text',
    beta: 'bg-beta-bg text-beta-text',
    prealpha: 'bg-preAlpha-bg text-preAlpha-text',
    inprogress: 'bg-warning-bg text-warning-text',
    ready: 'bg-success-bg text-success-text',
}

function getStatus(status: string): string {
    let statusKey = status.toLowerCase()
    return mapStatus[statusKey] !== undefined ? mapStatus[statusKey] : ''
}
</script>

<template>
    <div class="mb-4 flex flex-col">
        <h4 class="font-semibold">{{ title }}</h4>

        <ul>
            <router-link
                v-for="(item, itemKey) in items"
                :key="itemKey"
                :to="{ name: 'file', params: { id: item.id } }"
                class="flex cursor-pointer items-center justify-between p-2"
            >
                <span class="flex items-center">
                    <span
                        class="inline-block truncate"
                        :class="[
                            route.params.id === item.id ? 'font-semibold' : '',
                            item.status?.toLowerCase() === 'deprecated' ? 'line-through' : '',
                        ]"
                    >
                        {{ item.name }}
                    </span>
                </span>

                <span v-if="item?.status" class="ml-[10px] rounded-full p-1 text-xs" :class="[getStatus(item.status)]">
                    {{ item.status }}
                </span>
            </router-link>
        </ul>
    </div>
</template>
