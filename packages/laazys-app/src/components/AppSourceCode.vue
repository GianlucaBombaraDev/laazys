<script setup lang="ts">
import { computed } from 'vue'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'
import 'highlight.js/styles/default.css'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('xml', xml)

interface Props {
    source: string
}

const props = withDefaults(defineProps<Props>(), {
    source: '',
})

// Computed so the preview updates when navigating between files
const componentCodePreview = computed(() => hljs.highlightAuto(props.source).value)
</script>

<template>
    <div class="mt-4 h-[250px] w-full rounded-2xl border bg-white p-4 shadow-xs">
        <pre v-if="componentCodePreview && componentCodePreview !== ''" v-html="componentCodePreview"></pre>
    </div>
</template>
