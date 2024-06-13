<script setup lang="ts">
//@ts-ignore
import { useFileStore } from '../store/file.store'

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

const fileStore = useFileStore()
const current_file = fileStore.getCurrentFile()

const mapStatus: { [key: string]: string } = {
    deprecated: 'bg-deprecated-bg text-deprecated-text',
    alpha: 'bg-alpha-bg text-aplha-text',
    beta: 'bg-beta-bg text-beta-text',
    preAlpha: 'bg-preAlpha-bg text-preAlpha-text',
    inProgress: 'bg-warning-bg text-warning-text',
    ready: 'bg-success-bg text-success-text',
}

function getStatus(status: string): string {
    if (!status || status === '') return ''
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
                        class="text-body-text inline-block truncate"
                        :class="[
                            current_file === item.id ? 'font-semibold' : '',
                            item?.status && item?.status.toLowerCase() === 'deprecated' ? 'italic line-through' : '',
                        ]"
                    >
                        {{ item.name }}
                    </span>
                </span>

                <span
                    v-if="item?.status"
                    class="ml-[10px] rounded-full px-2 py-1 text-xs font-medium"
                    :class="[getStatus(item.status)]"
                >
                    {{ item.status }}
                </span>
            </router-link>
        </ul>
    </div>
</template>
