import { connect } from 'net'
import { homedir } from 'os'
import { join } from 'path'

// ── Protocol ─────────────────────────────────────────────────────────────
// Hivemind uses newline-delimited JSON with this envelope format:
//
//   Send:    {"MethodName": {"param": "value"}}
//   Receive: {"Success": {"data": ..., "duration_ms": ..., "step_count": ...}}
//            {"Error": {"message": "..."}}
//
// Methods: Orchestrate, Ping, Status, Discover
// ──────────────────────────────────────────────────────────────────────────

const HIVEMIND_SOCKET = join(homedir(), '.uds', 'hivemind.sock')

interface HivemindResult {
  data: any
  duration_ms?: number
  step_count?: number
}

/** Low-level MCP client for communicating with Hivemind. */
export class HivemindClient {
  private socketPath: string

  constructor(socketPath = HIVEMIND_SOCKET) {
    this.socketPath = socketPath
  }

  /** Ping the Hivemind server. */
  async ping(): Promise<boolean> {
    try {
      await this.send('Ping', null)
      return true
    } catch {
      return false
    }
  }

  /** Get Hivemind status. */
  async getStatus(): Promise<any> {
    return this.send('Status', null)
  }

  /** Discover available MCP services. */
  async discover(): Promise<any[]> {
    const res = await this.send('Discover', null)
    return res?.services || []
  }

  /** Orchestrate a natural-language task. */
  async orchestrate(task: string): Promise<HivemindResult> {
    const res = await this.send('Orchestrate', { task })
    return {
      data: res?.data,
      duration_ms: res?.duration_ms,
      step_count: res?.step_count
    }
  }

  /**
   * Execute a vault operation via Hivemind orchestration.
   * Hivemind routes to Re3Engine based on the task description.
   */
  async vault(method: string, params: Record<string, any>): Promise<any> {
    // Map vault methods to natural language tasks for Hivemind
    const taskMap: Record<string, string> = {
      vault_read: `Read the file at path "${params.path}" from the vault`,
      vault_write: `Write the following content to "${params.path}" in the vault:\n${params.content}`,
      vault_search: `Search the vault for "${params.query}"${params.limit ? ` (limit: ${params.limit})` : ''}`,
      vault_list: `List all files and directories at path "${params.path || '/'}" in the vault`,
      vault_summarize: `Summarize the file at path "${params.path}" from the vault`,
      vault_batch_tag: `Apply tag "${params.tag}" to all files matching pattern "${params.pattern}" in the vault`
    }

    const task = taskMap[method]
    if (!task) throw new Error(`Unknown vault method: ${method}`)

    const result = await this.orchestrate(task)
    return result.data
  }

  /**
   * Send a JSON-RPC request to Hivemind.
   * Format: {"MethodName": {"param": "value"}}
   * Response: {"Success": {...}} or {"Error": {"message": "..."}}
   */
  private send(method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const sock = connect(this.socketPath, () => {
        const body = JSON.stringify({ [method]: params }) + '\n'
        sock.write(body)
      })

      let data = ''
      const timeout = setTimeout(() => {
        sock.destroy()
        reject(new Error('Hivemind request timed out'))
      }, 15000)

      sock.on('data', (chunk) => {
        data += chunk.toString()
        const idx = data.indexOf('\n')
        if (idx >= 0) {
          clearTimeout(timeout)
          const line = data.slice(0, idx)
          sock.destroy()
          try {
            const parsed = JSON.parse(line)
            if ('Success' in parsed) {
              resolve(parsed.Success)
            } else if ('Error' in parsed) {
              reject(new Error(parsed.Error?.message || 'Hivemind error'))
            } else if ('StatusInfo' in parsed) {
              resolve(parsed.StatusInfo)
            } else {
              resolve(parsed)
            }
          } catch (e) {
            reject(new Error(`Parse error: ${e}`))
          }
        }
      })

      sock.on('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })
    })
  }
}
