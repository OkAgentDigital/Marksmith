import { ipcMain } from 'electron'
import { HIVEMIND_SOCKET, checkHivemind } from '../mcp/service'

let _hivemindClient: any = null

async function getHivemindClient() {
  if (_hivemindClient) {
    // Quick check it's still alive
    const alive = await _hivemindClient.ping().catch(() => false)
    if (alive) return _hivemindClient
    _hivemindClient = null
  }
  const { HivemindClient } = await import('../hivemind/client')
  _hivemindClient = new HivemindClient(HIVEMIND_SOCKET)
  return _hivemindClient
}

async function mcpRequest<T>(method: string, params?: any): Promise<T> {
  try {
    const client = await getHivemindClient()
    const result = await client.vault(method, params || {})
    return result as T
  } catch (e: any) {
    const msg = e?.message || ''
    if (msg.includes('ECONNREFUSED') || msg.includes('ENOENT') || msg.includes('connect')) {
      throw new Error(
        'Hivemind orchestrator is not running. Start it with: cd ~/Code/OkAgentDigital/Hivemind && cargo run --release'
      )
    }
    throw new Error(`MCP error: ${msg}`)
  }
}

export function registerMCPHandlers() {
  // Hivemind status check (used by renderer for the status indicator light)
  ipcMain.handle('mcp:status', async () => {
    try {
      const ok = await checkHivemind()
      return { connected: ok, socket: HIVEMIND_SOCKET }
    } catch {
      return { connected: false, socket: HIVEMIND_SOCKET }
    }
  })

  ipcMain.handle('mcp:read', async (_, path) => {
    return mcpRequest<string>('vault_read', { path })
  })
  ipcMain.handle('mcp:write', async (_, path, content) => {
    return mcpRequest<void>('vault_write', { path, content })
  })
  ipcMain.handle('mcp:search', async (_, query, limit = 10) => {
    return mcpRequest('vault_search', { query, limit })
  })
  ipcMain.handle('mcp:list', async (_, path) => {
    return mcpRequest('vault_list', { path })
  })
  ipcMain.handle('mcp:summarize', async (_, path) => {
    return mcpRequest<string>('vault_summarize', { path })
  })
  ipcMain.handle('mcp:batchTag', async (_, tag, pattern) => {
    return mcpRequest<void>('vault_batch_tag', { tag, pattern })
  })
}
