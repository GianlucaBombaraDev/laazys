import express from 'express'
import type { Express } from 'express'
import type { Server } from 'http'
import type { AddressInfo } from 'net'
import path from 'path'

export function createApp(filesList: any[], appDir: string) {
    const app = express()

    // Serve the built SPA (packages/laazys-app is built into appDir)
    app.use(express.static(appDir))

    app.get('/files', (req, res) => {
        res.json(filesList)
    })

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
