<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
    fileId: string
    status: { enabled: boolean; reason?: string }
    // Changes after each regeneration: the new src reloads the frame with the updated component
    revision: number
}>()

const frame = ref<HTMLIFrameElement | null>(null)
const height = ref(120)

// The preview page reports its content height so the frame fits the component
function onMessage(event: MessageEvent) {
    if (event.source === frame.value?.contentWindow && event.data?.type === 'laazys-preview-size') {
        height.value = event.data.height
    }
}

onMounted(() => window.addEventListener('message', onMessage))
onUnmounted(() => window.removeEventListener('message', onMessage))
</script>

<template>
    <section class="rounded-2xl border bg-surface p-4">
        <h2 class="mb-3 font-semibold">Anteprima</h2>

        <!-- White canvas on purpose: components are styled for the project's pages, not for this UI's theme -->
        <div
            v-if="props.status.enabled"
            class="pointer-events-none overflow-hidden rounded-lg border bg-white select-none"
        >
            <iframe
                ref="frame"
                :src="`/__laazys_preview/render/${props.fileId}?revision=${props.revision}`"
                title="Anteprima del componente"
                :style="{ height: `${height}px` }"
                class="block w-full"
                tabindex="-1"
                inert
            ></iframe>
        </div>
        <p v-else class="text-sm text-muted">Anteprima non disponibile: {{ props.status.reason }}</p>
    </section>
</template>
