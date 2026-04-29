import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow } from 'electron'
import { modelReady } from './database/api'
import { knex } from './database/model'
import './handle'
import { registerMCPHandlers } from './ipc/mcpHandlers'
import { initMCP } from './mcp/service'
import { setupApplicationMenu } from './menu'
import { registerUpdate } from './update'
import { Bound, createWindow, lastCloseWindow, winMap } from './window'
app.whenReady().then(async () => {
  await modelReady()
  electronApp.setAppUserModelId('com.marksmith')

  // Setup application menu
  setupApplicationMenu()
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  knex('setting')
    .where('key', 'windows')
    .first()
    .then((row) => {
      let created = false
      if (row) {
        try {
          const data = JSON.parse(row.value)
          for (const item of data) {
            created = true
            createWindow(item)
          }
        } catch (e) {
          created = true
          createWindow()
        }
      }
      if (!created) {
        createWindow()
      }
    })
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  registerUpdate()

  // Initialize MCP via Hivemind (non-blocking — don't crash if Hivemind isn't running)
  try {
    await initMCP()
    registerMCPHandlers()
  } catch (e) {
    console.warn('MCP not available (Hivemind not running):', (e as Error)?.message)
    // Register handlers anyway — they'll return friendly errors
    registerMCPHandlers()
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  const wins = BrowserWindow.getAllWindows()
  let data: Bound[] = []
  if (wins.length) {
    for (const w of wins) {
      const bound = w.getBounds()
      data.push({
        width: bound.width,
        height: bound.height,
        x: bound.x,
        y: bound.y,
        id: winMap.get(w),
        focus: w.isFocused()
      })
    }
  } else if (lastCloseWindow) {
    data.push(lastCloseWindow)
  }
  const row = await knex('setting').where('key', 'windows').first()
  if (row) {
    return knex('setting')
      .where('key', 'windows')
      .update({ value: JSON.stringify(data) })
  }
  return knex('setting').insert({ key: 'windows', value: JSON.stringify(data) })
})
