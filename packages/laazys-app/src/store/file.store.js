import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFileStore = defineStore('fileStore', () => {
    const files = ref(null)
    const current_file = ref(null)

    const getCurrentFile = (id) => files.value.filter((file) => file.id === id)[0]

    return {
        current_file,
        files,
        getCurrentFile,
    }
})
