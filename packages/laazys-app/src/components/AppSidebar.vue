<script setup lang="ts">
defineProps<{
    direction: 'left' | 'right'
}>()
</script>

<template>
    <div
        class="bg-sidebar fixed top-0 h-full p-4"
        :class="[direction === 'left' ? 'left-0  border-r' : 'right-0 border-l']"
    >
        <slot></slot>
    </div>
</template>
