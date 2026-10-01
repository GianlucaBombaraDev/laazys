<script setup>
import { provide } from 'vue'

/**
 * @description A component documented with every
 * supported tag, on two lines.
 * @status Beta
 * @requires Parent.vue
 * @figma https://www.figma.com/design/abc123/Panel?node-id=1-2
 * @previewProps {"isActive": true}
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
