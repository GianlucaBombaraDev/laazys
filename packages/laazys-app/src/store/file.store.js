import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFileStore = defineStore('fileStore', () => {
    const files = ref(null)
    const current_file = ref(null)
    // Component preview availability, from /preview.json
    const preview = ref({ enabled: false, reason: '' })
    // Bumped on every watch-mode regeneration, to reload the component previews
    const revision = ref(0)

    const getCurrentFile = (id) => files.value?.find((file) => file.id === id) ?? null

    return {
        current_file,
        files,
        preview,
        revision,
        getCurrentFile,
    }
})
