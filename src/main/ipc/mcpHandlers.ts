import { ipcMain } from 'electron'
import { getMCPClient } from '../mcp/service'

async function mcpRequest<T>(method: string, params?: any): Promise<T> {
  const client = getMCPClient()
  const response = await client.request<T>(method, params)
  if (response.error) {
    throw new Error(`MCP error: ${response.error.message}`)
  }
  return response.result as T
}

export function registerMCPHandlers() {
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
