<script setup lang="ts">
const query = defineModel<string>({ default: '' })
</script>

<template>
    <label class="block">
        <span class="sr-only">Cerca</span>
        <input
            v-model="query"
            type="search"
            placeholder="Cerca componenti, props, eventi…"
            class="w-full rounded-lg border bg-body px-3 py-2 text-sm placeholder:text-muted focus:outline-2 focus:outline-primary"
        />
    </label>
</template>
