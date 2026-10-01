import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFileStore = defineStore('fileStore', () => {
    const files = ref(null)
    const current_file = ref(null)

    const getCurrentFile = (id) => files.value?.find((file) => file.id === id) ?? null

    return {
        current_file,
        files,
        getCurrentFile,
    }
})
