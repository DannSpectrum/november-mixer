import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

type ApiResponse = ServerResponse & {
  status: (code: number) => ApiResponse
  json: (body: unknown) => void
}

type ApiHandler = (request: IncomingMessage, response: ApiResponse) => Promise<void> | void

/**
 * Runs the Vercel functions in `api/` inside the Vite dev server, so
 * `npm run dev` behaves like production (same handlers, env from .env files).
 * Example: GET /api/doctors → api/doctors.ts
 */
function serveApiFunctions(): Plugin {
  return {
    name: 'serve-api-functions',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const [pathname = ''] = (request.url ?? '').split('?')
        if (!pathname.startsWith('/api/')) {
          next()
          return
        }

        void (async () => {
          const res = response as ApiResponse
          res.status = code => {
            res.statusCode = code
            return res
          }
          res.json = body => {
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify(body))
          }

          const match = /^\/api\/([\w-]+)$/.exec(pathname)
          if (!match) {
            res.status(404).json({ error: `No function found for ${pathname}` })
            return
          }

          try {
            // Env files win over the shell so `.env.local` edits apply on the next request.
            Object.assign(process.env, loadEnv(server.config.mode, server.config.root, ''))
            const apiModule = await server.ssrLoadModule(`/api/${match[1]}.ts`)
            const handler = (apiModule as { default: ApiHandler }).default
            await handler(request, res)
          } catch (error) {
            console.error('[dev api]', error)
            if (!res.headersSent) {
              res.status(500).json({ error: error instanceof Error ? error.message : 'Unexpected dev API error' })
            } else {
              res.end()
            }
          }
        })()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), serveApiFunctions()],
})
