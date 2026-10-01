<script setup>
defineProps({ name: { type: String, required: true } })
</script>

<template>
    <p class="hello">Hello {{ name }}</p>
</template>
