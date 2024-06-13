<script setup lang="ts">
const props = defineProps<{
    placeholder: string
}>()

const value = defineModel()
</script>

<template>
    <input type="text" v-model="value" :placeholder="placeholder" class="rounded-md border bg-white px-2 py-1" />
</template>
