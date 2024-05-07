<script setup lang="ts">
interface Props {
    name: string
    path: string
    description?: string
    requires?: string
}

withDefaults(defineProps<Props>(), {
    name: '',
    path: '',
    description: '',
    requires: '',
})
</script>

<template>
    <div class="flex flex-col">
        <h2 class="text-xl font-bold">{{ name }}</h2>
        <p class="mt-2 inline-block text-sm">
            {{ path }}
        </p>
        <p v-if="description && description !== ''" class="mt-2 inline-block">
            {{ description }}
        </p>

        <div v-if="requires" class="mt-2">
            <span>
                Richiede: <strong>{{ requires }}</strong>
            </span>
        </div>
    </div>
</template>
