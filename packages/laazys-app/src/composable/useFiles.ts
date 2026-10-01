import axios from 'axios'

export function useFiles() {
    /**
     * Get list of components
     * @returns
     */
    async function getFiles() {
        let response

        try {
            response = await axios.get(window.location.origin + '/files')
        } catch (error) {
            console.error('Error loading files:', error)
            response = { data: [] }
        }

        return response.data
    }

    async function getIcons() {
        let response

        try {
            // Absolute path, otherwise it resolves to /file/icons.json on nested routes
            response = await axios.get('/icons.json')
        } catch (error) {
            console.error('Error loading icons:', error)
            response = { data: {} }
        }

        return response.data
    }

    return {
        getFiles,
        getIcons,
    }
}
