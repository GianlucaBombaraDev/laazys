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

    async function getTheme() {
        let response

        try {
            response = await axios.get('/theme.json')
        } catch (error) {
            console.error('Error loading theme:', error)
            response = { data: {} }
        }

        return response.data
    }

    async function getPreviewStatus() {
        let response

        try {
            response = await axios.get('/preview.json')
        } catch (error) {
            console.error('Error loading the preview status:', error)
            response = { data: { enabled: false, reason: 'the server did not answer' } }
        }

        return response.data
    }

    /**
     * Call `callback` whenever the CLI regenerates the docs (`laazys --watch`).
     * Returns a function that stops listening.
     */
    function onFilesUpdate(callback: () => void) {
        const events = new EventSource('/events')
        events.addEventListener('update', callback)
        return () => events.close()
    }

    return {
        getFiles,
        getIcons,
        getTheme,
        getPreviewStatus,
        onFilesUpdate,
    }
}
