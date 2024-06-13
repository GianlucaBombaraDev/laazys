$
<script setup lang="ts">
/**
 * Show preview of source code
 */
import { onMounted, ref } from 'vue'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/default.css'
import AppCard from './AppCard.vue'

hljs.registerLanguage('javascript', javascript)

interface Props {
    source: string
}

const props = withDefaults(defineProps<Props>(), {
    source: '',
})

const componentCodePreview = ref('')

async function formattedAndHighlightedCode() {
    return hljs.highlightAuto(props.source).value
}

onMounted(async () => {
    componentCodePreview.value = await formattedAndHighlightedCode()
})
</script>

<template>
    <AppCard>
        <pre v-if="componentCodePreview && componentCodePreview !== ''" v-html="componentCodePreview"></pre>
    </AppCard>
</template>
