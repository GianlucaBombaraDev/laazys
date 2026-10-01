<script setup lang="ts">
import { computed, ref } from 'vue'
import { figmaEmbedUrl, isFigmaUrl } from '../utils/figma'

const props = defineProps<{ url: string }>()

const valid = computed(() => isFigmaUrl(props.url))
// Loaded on demand: the embed is heavy and may ask the visitor to log in to Figma
const showEmbed = ref(false)
</script>

<template>
    <section class="rounded-2xl border bg-surface p-4">
        <h2 class="mb-3 font-semibold">Design</h2>

        <template v-if="valid">
            <div class="flex flex-wrap items-center gap-3">
                <a :href="props.url" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
                    Apri in Figma ↗
                </a>
                <button type="button" class="rounded-lg border px-3 py-1 text-sm" @click="showEmbed = !showEmbed">
                    {{ showEmbed ? 'Nascondi il design' : 'Mostra il design' }}
                </button>
            </div>
            <iframe
                v-if="showEmbed"
                :src="figmaEmbedUrl(props.url)"
                title="Design Figma"
                class="mt-3 h-[450px] w-full rounded-lg border"
                allowfullscreen
            ></iframe>
        </template>
        <p v-else class="text-sm text-muted">
            Link Figma non valido: <code>{{ props.url }}</code
            >. Usa un link https di figma.com.
        </p>
    </section>
</template>
