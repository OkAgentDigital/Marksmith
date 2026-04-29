import { homedir } from 'os'
import { join } from 'path'

// ── Architecture ─────────────────────────────────────────────────────────
//   Marksmith → Hivemind (~/.uds/hivemind.sock) → Re3Engine, OpenRouter, …
//
// Hivemind is the MCP orchestration layer that provides:
//   - Service discovery (finds re3engine.sock, openrouter, etc.)
//   - Intent parsing & execution planning via natural language tasks
//   - Swarm coordination, budget control, multi-model routing
//   - Observability & feed spool tracing
//
// Start Hivemind before using vault/LLM tools:
//   cd ~/Code/OkAgentDigital/Hivemind && cargo run --release
//
// The client connects lazily — startup won't fail if Hivemind isn't running.
// ──────────────────────────────────────────────────────────────────────────

export const HIVEMIND_SOCKET = join(homedir(), '.uds', 'hivemind.sock')

let _ready = false

/**
 * Check if Hivemind is reachable. Returns false if not (no throw).
 */
export async function checkHivemind(): Promise<boolean> {
  if (_ready) return true
  try {
    const { HivemindClient } = await import('../hivemind/client')
    const client = new HivemindClient(HIVEMIND_SOCKET)
    const ok = await client.ping()
    _ready = ok
    return ok
  } catch {
    return false
  }
}

/** Initialize MCP at startup (best-effort, no crash). */
export async function initMCP() {
  // Just a connectivity check — actual init happens on first request
  _ready = await checkHivemind()
  if (_ready) {
    console.log('Hivemind connected at', HIVEMIND_SOCKET)
  }
}

export function getSocketPath(): string {
  return HIVEMIND_SOCKET
}
