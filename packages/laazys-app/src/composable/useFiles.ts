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
            response = { data: error }
        }

        return response.data
    }

    async function getIcons() {
        let response

        try {
            response = await axios.get('icons.json')
        } catch (error) {
            response = { data: error }
        }

        return response.data
    }

    return {
        getFiles,
        getIcons,
    }
}
