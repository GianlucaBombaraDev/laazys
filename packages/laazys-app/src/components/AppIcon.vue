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
    sizing: {
        // @ts-ignore
        width: 'w-[24px]',
        height: 'h-[24px]',
    },
})

const { getIcons } = useFiles()

const loadSVG = async () => {
    try {
        // @ts-ignore
        const json = await getIcons()
        // @ts-ignore
        return json[props.name]
    } catch (error) {
        console.error('Error loading SVG:', error)
        return null
    }
}

const svgContent = ref(null)

onMounted(async () => {
    svgContent.value = await loadSVG()
})
</script>

<template>
    <div v-if="svgContent" v-html="svgContent" :class="[sizing.height, sizing.width]"></div>
</template>
