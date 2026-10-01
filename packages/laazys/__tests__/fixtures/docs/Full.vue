<script setup>
import { provide } from 'vue'

/**
 * @description A component documented with every
 * supported tag, on two lines.
 * @status Beta
 * @requires Parent.vue
 */

defineProps({
    isActive: { type: Boolean, default: false },
})

defineEmits(['update'])

/**
 * @method open
 * Opens the panel.
 * @param {string} title - The panel title.
 * @returns {boolean} - Whether it opened.
 */
function open() {}

/**
 * @method close
 * Closes the panel.
 */
function close() {}

/**
 * @provide panel|open
 */
provide('panel', { open, close })
</script>

<template>
    <div @click="$emit('update')">
        <slot></slot>
    </div>
</template>
