import { app, Menu, shell, BrowserWindow, MenuItemConstructorOptions } from 'electron'

export function setupApplicationMenu() {
  const appName = 'Marksmith'
  
  const menuTemplate: MenuItemConstructorOptions[] = [
    // Application menu (macOS only)
    ...(process.platform === 'darwin' ? [{
      label: appName,
      submenu: [
        { role: 'about' } as MenuItemConstructorOptions,
        { type: 'separator' } as MenuItemConstructorOptions,
        {
          label: 'Settings...',
          accelerator: 'Cmd+,',
          click: () => {
            const win = BrowserWindow.getAllWindows()[0]
            if (win) {
              win.webContents.send('open-settings')
            }
          }
        } as MenuItemConstructorOptions,
        { type: 'separator' } as MenuItemConstructorOptions,
        { role: 'services' } as MenuItemConstructorOptions,
        { type: 'separator' } as MenuItemConstructorOptions,
        { role: 'hide' } as MenuItemConstructorOptions,
        { role: 'hideOthers' } as MenuItemConstructorOptions,
        { role: 'unhide' } as MenuItemConstructorOptions,
        { type: 'separator' } as MenuItemConstructorOptions,
        { 
          label: 'Quit Marksmith', 
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        } as MenuItemConstructorOptions
      ]
    } as MenuItemConstructorOptions] : []),
    // File menu
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
        } as MenuItemConstructorOptions,
        {
          label: 'Import Folder...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            const win = BrowserWindow.getAllWindows()[0]
            if (win) {
              win.webContents.send('import-folder')
            }
          }
        } as MenuItemConstructorOptions,
        {
          label: 'Import File...',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => {
            const win = BrowserWindow.getAllWindows()[0]
            if (win) {
              win.webContents.send('import-file')
            }
          }
        } as MenuItemConstructorOptions,
        { type: 'separator' } as MenuItemConstructorOptions,
        process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' } as MenuItemConstructorOptions
      ]
    } as MenuItemConstructorOptions,
    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' } as MenuItemConstructorOptions,
        { role: 'redo' } as MenuItemConstructorOptions,
        { type: 'separator' } as MenuItemConstructorOptions,
        { role: 'cut' } as MenuItemConstructorOptions,
        { role: 'copy' } as MenuItemConstructorOptions,
        { role: 'paste' } as MenuItemConstructorOptions,
        ...(process.platform === 'darwin' ? [
          { role: 'pasteAndMatchStyle' } as MenuItemConstructorOptions,
          { role: 'delete' } as MenuItemConstructorOptions,
          { role: 'selectAll' } as MenuItemConstructorOptions,
          { type: 'separator' } as MenuItemConstructorOptions,
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' } as MenuItemConstructorOptions,
              { role: 'stopSpeaking' } as MenuItemConstructorOptions
            ]
          } as MenuItemConstructorOptions
        ] : [
          { role: 'delete' } as MenuItemConstructorOptions,
          { type: 'separator' } as MenuItemConstructorOptions,
          { role: 'selectAll' } as MenuItemConstructorOptions
        ])
      ]
    } as MenuItemConstructorOptions,
    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' } as MenuItemConstructorOptions,
        { role: 'forceReload' } as MenuItemConstructorOptions,
        { role: 'toggleDevTools' } as MenuItemConstructorOptions,
        { type: 'separator' } as MenuItemConstructorOptions,
        { role: 'resetZoom' } as MenuItemConstructorOptions,
        { role: 'zoomIn' } as MenuItemConstructorOptions,
        { role: 'zoomOut' } as MenuItemConstructorOptions,
        { type: 'separator' } as MenuItemConstructorOptions,
        { role: 'togglefullscreen' } as MenuItemConstructorOptions
      ]
    } as MenuItemConstructorOptions,
    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' } as MenuItemConstructorOptions,
        { role: 'zoom' } as MenuItemConstructorOptions,
        ...(process.platform === 'darwin' ? [
          { type: 'separator' } as MenuItemConstructorOptions,
          { role: 'front' } as MenuItemConstructorOptions,
          { type: 'separator' } as MenuItemConstructorOptions,
          { role: 'window' } as MenuItemConstructorOptions
        ] : [
          { role: 'close' } as MenuItemConstructorOptions
        ])
      ]
    } as MenuItemConstructorOptions,
    // Help menu
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/OkAgentDigital/marksmith')
          }
        } as MenuItemConstructorOptions,
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/OkAgentDigital/marksmith/blob/master/README.md')
          }
        } as MenuItemConstructorOptions,
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('https://github.com/OkAgentDigital/marksmith/issues')
          }
        } as MenuItemConstructorOptions
      ]
    } as MenuItemConstructorOptions
  ]

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
  
  // Set the app name for macOS
  if (process.platform === 'darwin') {
    app.setName(appName)
  }
}