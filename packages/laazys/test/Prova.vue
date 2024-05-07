<script setup>
import { useProva } from './useProva'
/**
 * @description sono la descrizione del file vue, anche
 * se vado su due righe
 *
 * @requires App.vue
 * @status Deprecated
 */

const props = defineProps({
    isActive: {
        type: Boolean,
        default: false,
    },
})

const emits = defineEmits(['click:update'])

const { test } = useProva()

/**
 * @method Ciao
 * Spiego cosa fa il method
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 * @return {string} Prova return.
 */
function ciao() {}

/**
 * @provide method|ciao
 */
provide('ciao', 'ciao')
</script>

<template>
    <div @click.prevent="emits('click:update')">
        <p>ciao! sono una prova</p>
        <slot></slot>
    </div>
</template>
