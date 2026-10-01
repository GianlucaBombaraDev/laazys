<script setup>
defineEmits(['close'])
</script>

<template>
    <button @click="$emit('close')">x</button>
</template>
