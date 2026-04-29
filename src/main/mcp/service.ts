import { MCPClient } from '@udos/mcp-client'
import { homedir } from 'os'
import { join } from 'path'

let client: MCPClient | null = null

export async function initMCP() {
  client = new MCPClient({
    socketPath: join(homedir(), 'vault', '.uds', 'mcp.sock')
  })
  await client.connect()
  return client
}

export function getMCPClient() {
  if (!client) throw new Error('MCP not initialized')
  return client
}
