import { app, Menu, shell, BrowserWindow } from 'electron'

export function setupApplicationMenu() {
  const appName = 'Marksmith'
  
  const template: Electron.MenuItemConstructorOptions[] = [
    // { role: 'appMenu' }
    ...(process.platform === 'darwin' ? [{
      label: appName,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Settings...',
          accelerator: 'Cmd+,',
          click: () => {
            const win = BrowserWindow.getAllWindows()[0]
            if (win) {
              win.webContents.send('open-settings')
            }
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { 
          label: 'Quit Marksmith', 
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    }] : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        {
          label: 'New Vault...',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            const win = BrowserWindow.getAllWindows()[0]
            if (win) {
              win.webContents.send('create-new-vault')
            }
          }
        },
        {
          label: 'Import Folder...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            const win = BrowserWindow.getAllWindows()[0]
            if (win) {
              win.webContents.send('import-folder')
            }
          }
        },
        {
          label: 'Import File...',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => {
            const win = BrowserWindow.getAllWindows()[0]
            if (win) {
              win.webContents.send('import-file')
            }
          }
        },
        { type: 'separator' },
        process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(process.platform === 'darwin' ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/OkAgentDigital/marksmith')
          }
        },
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/OkAgentDigital/marksmith/blob/master/README.md')
          }
        },
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('https://github.com/OkAgentDigital/marksmith/issues')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  
  // Set the app name for macOS
  if (process.platform === 'darwin') {
    app.setName(appName)
  }
}