# DevStudio Instructions – Marksmith MCP Integration (Next Session)

**Target:** Marksmith (Electron + React)  
**Goal:** Add full MCP client, connect chat to vault (read/write/enhance/batch)  
**Tool:** DevStudio (or any IDE) – commands assume macOS/Linux terminal.

---

## Step 0 – Preparation

```bash
# Ensure MCP server is running (from uDos)
cd ~/Code/uDosGo
cargo run --bin mcp-server &
# or: udos dev

# Verify socket exists
ls -la ~/vault/.local/mcp.sock
```

---

## Step 1 – Add `@udos/mcp-client` dependency

In `~/Code/Apps/Marksmith`:

```bash
npm install @udos/mcp-client@latest --save
```

If not published yet, use local path:

```bash
npm install ~/Code/uDosGo/packages/mcp-client --save
```

---

## Step 2 – Create MCP service in main process

**File:** `src/main/mcp/service.ts`

```typescript
import { MCPClient, UnixSocketTransport } from '@udos/mcp-client';

let client: MCPClient | null = null;

export async function initMCP() {
  const transport = new UnixSocketTransport({
    socketPath: process.env.MCP_SOCKET || '~/vault/.local/mcp.sock'
  });
  client = new MCPClient({ transport });
  await client.connect();
  return client;
}

export function getMCPClient() {
  if (!client) throw new Error('MCP not initialized');
  return client;
}
```

---

## Step 3 – Expose MCP via IPC (preload & main)

**3.1 Preload API** – `src/preload/api.ts`

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('mcp', {
  read: (path: string) => ipcRenderer.invoke('mcp:read', path),
  write: (path: string, content: string) => ipcRenderer.invoke('mcp:write', path, content),
  search: (query: string, limit?: number) => ipcRenderer.invoke('mcp:search', query, limit),
  list: (path: string) => ipcRenderer.invoke('mcp:list', path),
  summarize: (path: string) => ipcRenderer.invoke('mcp:summarize', path),
  batchTag: (tag: string, pattern: string) => ipcRenderer.invoke('mcp:batchTag', tag, pattern),
});
```

**3.2 Main process handlers** – `src/main/ipc/mcpHandlers.ts`

```typescript
import { ipcMain } from 'electron';
import { getMCPClient } from '../mcp/service';

export function registerMCPHandlers() {
  ipcMain.handle('mcp:read', async (_, path) => {
    const client = getMCPClient();
    return client.request('vault_read', { path });
  });
  ipcMain.handle('mcp:write', async (_, path, content) => {
    const client = getMCPClient();
    return client.request('vault_write', { path, content });
  });
  ipcMain.handle('mcp:search', async (_, query, limit = 10) => {
    const client = getMCPClient();
    return client.request('vault_search', { query, limit });
  });
  // ... add list, summarize, batchTag similarly
}
```

**3.3 Register in `src/main/index.ts`** after app ready:

```typescript
import { initMCP } from './mcp/service';
import { registerMCPHandlers } from './ipc/mcpHandlers';

app.whenReady().then(async () => {
  await initMCP();
  registerMCPHandlers();
  // ... rest of startup
});
```

---

## Step 4 – Renderer hook (`src/renderer/src/hooks/useMCP.ts`)

```typescript
export function useMCP() {
  const read = async (path: string) => window.mcp.read(path);
  const write = async (path: string, content: string) => window.mcp.write(path, content);
  const search = async (query: string, limit?: number) => window.mcp.search(query, limit);
  const list = async (path: string) => window.mcp.list(path);
  const summarize = async (path: string) => window.mcp.summarize(path);
  const batchTag = async (tag: string, pattern: string) => window.mcp.batchTag(tag, pattern);

  return { read, write, search, list, summarize, batchTag };
}
```

---

## Step 5 – Chat UI integration (example component)

**File:** `src/renderer/src/ui/chat/ChatInputWithVault.tsx`

```tsx
import { useState } from 'react';
import { useMCP } from '../../hooks/useMCP';

export const ChatInputWithVault = () => {
  const [message, setMessage] = useState('');
  const { search, read, summarize } = useMCP();

  const handleMention = async (mention: string) => {
    // mention = "@toybox/file.md"
    const path = mention.slice(1);
    const content = await read(path);
    setMessage(prev => prev + `\n\n[Context from ${path}]:\n${content}\n`);
  };

  const handleSummarizeCurrent = async () => {
    // get current editor file path from global state
    const path = getCurrentFilePath();
    const summary = await summarize(path);
    setMessage(prev => prev + `\nSummary of ${path}:\n${summary}\n`);
  };

  return (
    <div>
      <textarea value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={handleSummarizeCurrent}>Summarize open file</button>
      {/* mention picker UI can be added */}
    </div>
  );
};
```

---

## Step 6 – Test

1. Run Marksmith dev server:  
   ```bash
   npm run dev
   ```
2. Open chat panel.
3. Type a mention like `@toybox/README.md` (should fetch content).
4. Click "Summarize open file" (requires MCP server to have `vault_summarize` tool – may need stub).

If missing tools, implement stubs in MCP server or add IPC fallbacks.

---

## Step 7 – Next enhancements (after basic MCP works)

- Add **tool calling** to let LLM invoke MCP functions automatically.
- Build **batch UI** (multi‑select files, apply tag/move).
- Implement **auto‑linking** between files.
- Add **settings toggle** to enable/disable dangerous tools (write, delete).

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Cannot find module '@udos/mcp-client'` | Ensure package is built: `cd packages/mcp-client && npm run build` |
| `Connection refused` | MCP server not running: run `cargo run --bin mcp-server` |
| `EACCES: permission denied` | Socket permissions: `chmod 600 ~/vault/.local/mcp.sock` |
| Tool not implemented | Add stub handler in MCP server or skip for now |

---

**Save this as `dev-instructions-mcp.md` in the Marksmith repo root.** Next session: execute steps 1–4 first, then test with a simple chat command.
