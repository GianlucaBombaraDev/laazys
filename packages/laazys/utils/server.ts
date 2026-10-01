import express from 'express'
import type { Express } from 'express'
import type { Server } from 'http'
import type { AddressInfo } from 'net'
import { EventEmitter } from 'events'
import path from 'path'
import { PREVIEW_BASE, previewHtml } from './preview'
import type { Preview } from './preview'

/** The parsed documentation, replaceable at runtime (watch mode) */
export class DocsState extends EventEmitter {
    constructor(public files: any[]) {
        super()
    }

    update(files: any[]) {
        this.files = files
        this.emit('update')
    }
}

type AppOptions = { theme?: object; preview?: Preview }

const NO_PREVIEW: Preview = { enabled: false, reason: 'Preview disabled' }

export function createApp(state: DocsState, appDir: string, { theme = {}, preview = NO_PREVIEW }: AppOptions = {}) {
    const app = express()

    app.get('/files', (req, res) => {
        res.json(state.files)
    })

    app.get('/theme.json', (req, res) => {
        res.json(theme)
    })

    // Server-Sent Events: tells the open pages to reload /files after a change
    app.get('/events', (req, res) => {
        res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' })
        res.flushHeaders()

        const notify = () => res.write('event: update\ndata: {}\n\n')
        state.on('update', notify)
        req.on('close', () => state.off('update', notify))
    })

    app.get('/preview.json', (req, res) => {
        res.json(preview.enabled ? { enabled: true } : preview)
    })

    if (preview.enabled) {
        // Page rendering one component, loaded by the UI in an iframe
        app.get(`${PREVIEW_BASE}render/:id`, async (req, res) => {
            const file = state.files.find((item) => item.id === req.params.id && item.extension === 'vue')
            if (!file) {
                res.status(404).send('Unknown component')
                return
            }
            res.type('html').send(await preview.server.transformIndexHtml(req.originalUrl, previewHtml(file)))
        })

        // Modules, CSS and assets of the project, compiled by its own Vite
        app.use(preview.server.middlewares)
    }

    // Serve the built SPA (packages/laazys-app is built into appDir)
    app.use(express.static(appDir))

    // History-mode fallback so client routes like /file/:id survive a page reload
    app.get('/{*splat}', (req, res) => {
        res.sendFile(path.join(appDir, 'index.html'))
    })

    return app
}

/**
 * Start listening, moving to the next port while the requested one is busy.
 * Resolves with the port actually in use.
 */
export function startServer(app: Express, port: number, host = 'localhost'): Promise<{ server: Server; port: number }> {
    return new Promise((resolve, reject) => {
        // Bind to localhost only by default: /files exposes the project's source code.
        // Express 5 passes listen errors (e.g. EADDRINUSE) to the callback.
        const server = app.listen(port, host, (err?: NodeJS.ErrnoException) => {
            if (err) {
                if (err.code === 'EADDRINUSE') {
                    console.warn(`Port ${port} is already in use, trying port ${port + 1}`)
                    console.log()
                    resolve(startServer(app, port + 1, host))
                } else {
                    reject(err)
                }
                return
            }

            resolve({ server, port: (server.address() as AddressInfo).port })
        })
    })
}
