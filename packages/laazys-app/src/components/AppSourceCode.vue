$
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/default.css'

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
    <div class="mt-4 h-[250px] w-full rounded-2xl border bg-white p-4 shadow-sm">
        <pre v-if="componentCodePreview && componentCodePreview !== ''" v-html="componentCodePreview"></pre>
    </div>
</template>
