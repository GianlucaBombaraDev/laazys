import express from 'express'
import type { Express } from 'express'
import type { Server } from 'http'
import type { AddressInfo } from 'net'
import { EventEmitter } from 'events'
import path from 'path'

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

export function createApp(state: DocsState, appDir: string, theme: object = {}) {
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
