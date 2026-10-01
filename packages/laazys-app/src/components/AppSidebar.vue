<script setup lang="ts">
// Always visible from md up; below that it slides in when `open`
withDefaults(defineProps<{ open?: boolean }>(), { open: false })
</script>

<template>
    <aside
        class="fixed inset-y-0 left-0 z-30 w-[300px] overflow-y-auto border-r bg-surface p-4 transition-transform md:translate-x-0"
        :class="open ? 'translate-x-0' : '-translate-x-full'"
    >
        <slot></slot>
    </aside>
</template>
