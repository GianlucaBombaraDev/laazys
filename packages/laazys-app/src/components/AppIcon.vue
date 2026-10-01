<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useFiles } from '../composable/useFiles'

interface ISizing {
    width: string
    height: string
}

interface Props {
    name: string
    sizing?: ISizing
}

const props = withDefaults(defineProps<Props>(), {
    name: 'add',
    sizing: () => ({
        width: 'w-[24px]',
        height: 'h-[24px]',
    }),
})

const { getIcons } = useFiles()

// getIcons never throws: on failure it returns {} and the icon is simply not rendered
const loadSVG = async () => {
    const json = await getIcons()
    return json[props.name] ?? null
}

const svgContent = ref(null)

onMounted(async () => {
    svgContent.value = await loadSVG()
})
</script>

<template>
    <div v-if="svgContent" :class="[sizing.height, sizing.width]" v-html="svgContent"></div>
</template>
