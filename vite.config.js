import { defineConfig } from 'vite'
import { createServer as createHttp } from 'http'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __dir = dirname(fileURLToPath(import.meta.url))
const DIST  = resolve(__dir, 'dist/main.js')
const PORT  = 3000

let httpStarted = false
let clients     = []
let version     = Date.now().toString()

function notifyClients() {
  version = Date.now().toString()
  clients = clients.filter(r => !r.writableEnded)
  clients.forEach(r => r.write(`data: ${version}\n\n`))
}

function startDevServer() {
  if (httpStarted) return
  httpStarted = true

  // ── HTTP : sert dist/main.js + endpoint SSE ──────────────
  const server = createHttp((req, res) => {
    const url = req.url?.split('?')[0]
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end() }

    if (url === '/main.js') {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      try   { return res.end(readFileSync(DIST, 'utf8')) }
      catch { res.writeHead(503); return res.end('// Build en cours…') }
    }

    if (url === '/sse-reload') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':   'keep-alive',
        'Access-Control-Allow-Origin': '*',
      })
      res.flushHeaders()
      res.write(`data: ${version}\n\n`)
      clients.push(res)
      req.on('close', () => { clients = clients.filter(c => c !== res) })
      return
    }

    res.writeHead(404); res.end()
  })

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  Serveur dev : http://localhost:${PORT}/main.js`)
    console.log('  Démarrage du tunnel Cloudflare…\n')

    // ── Cloudflare Tunnel ─────────────────────────────────
    const tunnel = spawn(
      'npx',
      ['cloudflared@latest', 'tunnel', '--url', `http://localhost:${PORT}`],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    )

    const onData = (data) => {
      const match = data.toString().match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)
      if (!match) return
      const url = match[0]
      console.log('\n╔══════════════════════════════════════════════════════╗')
      console.log('║  ✅  Tout est prêt — colle ça dans Webflow           ║')
      console.log('╠══════════════════════════════════════════════════════╣')
      console.log('║                                                      ║')
      console.log(`║  Before </body> :                                    ║`)
      console.log(`║                                                      ║`)
      console.log(`║  <script src="${url}/main.js"></script>`)
      console.log('║                                                      ║')
      console.log('╚══════════════════════════════════════════════════════╝\n')
    }

    tunnel.stdout.on('data', onData)
    tunnel.stderr.on('data', onData)
    process.on('exit', () => tunnel.kill())
  })
}

export default defineConfig({
  build: {
    lib: {
      entry:    './main.js',
      name:     'HisLab',
      formats:  ['iife'],
      fileName: () => 'main.js',
    },
    outDir:      'dist',
    emptyOutDir: true,
    minify:      !process.env.VITE_DEV,
  },

  plugins: [{
    name: 'his-lab',

    buildStart() {
      if (this.meta.watchMode) startDevServer()
    },

    closeBundle() {
      if (!this.meta.watchMode) return
      notifyClients()
      console.log('  ↻ main.js rebuilt')
    },
  }],
})
