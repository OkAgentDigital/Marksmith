import { app } from 'electron'
import * as path from 'path'
import * as fs from 'fs-extra'
import { ISpace } from '../../types/model'

/**
 * Vault Manager - Implements Marksmith Vault Specification v2.0.4+
 * Manages master vault, system flux folders, workspaces, and binders
 */
export class VaultManager {
  private vaultPath: string
  private userDataPath: string
  
  // System flux folder mappings (internal → display)
  private systemFolders = {
    '-inbox': '+inbox',
    '=feed': '=feed',
    '-outbox': '-outbox'
  }
  
  // System folder icons
  private systemFolderIcons = {
    '+inbox': '📥',
    '=feed': '📡',
    '-outbox': '📤'
  }
  
  constructor(vaultPath?: string) {
    this.userDataPath = app.getPath('userData')
    // Allow custom vault path or default to ~/vault/
    this.vaultPath = vaultPath ? 
      vaultPath.startsWith('~') ? vaultPath.replace('~', this.userDataPath) : vaultPath :
      path.join(this.userDataPath, 'vault')
  }
  
  /**
   * Set custom vault path
   */
  setVaultPath(newPath: string): void {
    if (newPath.startsWith('~')) {
      this.vaultPath = newPath.replace('~', this.userDataPath)
    } else {
      this.vaultPath = newPath
    }
  }
  
  /**
   * Get current vault path
   */
  getVaultPath(): string {
    return this.vaultPath
  }
  
  /**
   * Get master vault path (alias for getVaultPath)
   * @deprecated Use getVaultPath() instead
   */
  getMasterVaultPath(): string {
    return this.getVaultPath()
  }
  
  /**
   * Initialize the vault system
   * Creates master vault and system flux folders if they don't exist
   */
  async initialize(): Promise<void> {
    // Create vault directory
    await fs.ensureDir(this.vaultPath)
    
    // Create system flux folders
    for (const [internalName, displayName] of Object.entries(this.systemFolders)) {
      const folderPath = path.join(this.vaultPath, internalName)
      await fs.ensureDir(folderPath)
      
      // Create README.md in each system folder
      const readmePath = path.join(folderPath, 'README.md')
      if (!fs.existsSync(readmePath)) {
        const readmeContent = this.generateSystemFolderReadme(displayName, internalName)
        await fs.writeFile(readmePath, readmeContent, 'utf8')
      }
    }
    
    // Create assets and templates directories
    await fs.ensureDir(path.join(this.vaultPath, 'assets'))
    await fs.ensureDir(path.join(this.vaultPath, 'templates'))
    
    // Create .marksmith directory for app state
    const appStatePath = path.join(this.vaultPath, '.marksmith')
    await fs.ensureDir(appStatePath)
    
    // Create WELCOME.md if it doesn't exist
    const welcomePath = path.join(this.vaultPath, 'WELCOME.md')
    if (!fs.existsSync(welcomePath)) {
      await fs.writeFile(welcomePath, this.generateWelcomeContent(), 'utf8')
    }
    
    // Create README.md for vault overview
    const vaultReadmePath = path.join(this.vaultPath, 'README.md')
    if (!fs.existsSync(vaultReadmePath)) {
      await fs.writeFile(vaultReadmePath, this.generateVaultReadme(), 'utf8')
    }
  }
  
  /**
   * Get system folder paths
   */
  getSystemFolderPaths(): Record<string, string> {
    const result: Record<string, string> = {}
    for (const [internalName, displayName] of Object.entries(this.systemFolders)) {
      result[displayName] = path.join(this.vaultPath, internalName)
    }
    return result
  }
  
  /**
   * Get system folder display name from internal name
   */
  getSystemFolderDisplayName(internalName: string): string | undefined {
    return this.systemFolders[internalName]
  }
  
  /**
   * Get system folder internal name from display name
   */
  getSystemFolderInternalName(displayName: string): string | undefined {
    return Object.entries(this.systemFolders).find(
      ([, disp]) => disp === displayName
    )?.[0]
  }
  
  /**
   * Get system folder icon
   */
  getSystemFolderIcon(displayName: string): string {
    return this.systemFolderIcons[displayName] || '📁'
  }
  
  /**
   * Check if a folder name is a system folder
   */
  isSystemFolder(name: string): boolean {
    return name in this.systemFolders || name in Object.values(this.systemFolders)
  }
  
  /**
   * Get all system folder information
   */
  getSystemFoldersInfo(): Array<{
    internalName: string
    displayName: string
    path: string
    icon: string
    description: string
  }> {
    return Object.entries(this.systemFolders).map(([internalName, displayName]) => ({
      internalName,
      displayName,
      path: path.join(this.vaultPath, internalName),
      icon: this.systemFolderIcons[displayName],
      description: this.getSystemFolderDescription(displayName)
    }))
  }
  
  /**
   * Create a new workspace
   */
  async createWorkspace(workspaceName: string): Promise<ISpace> {
    if (this.isSystemFolder(workspaceName)) {
      throw new Error(`Cannot create workspace with system folder name: ${workspaceName}`)
    }
    
    if (!workspaceName.startsWith('@')) {
      throw new Error('Workspace names must start with @')
    }
    
    const workspacePath = path.join(this.vaultPath, workspaceName)
    await fs.ensureDir(workspacePath)
    
    // Create README.md
    const readmePath = path.join(workspacePath, 'README.md')
    if (!fs.existsSync(readmePath)) {
      const readmeContent = `# ${workspaceName}

This is your ${workspaceName} workspace.

- **Created**: ${new Date().toISOString()}
- **Purpose**: Organize your notes and projects
- **Location**: \`${workspacePath}\`

## Getting Started

1. Create new notes by clicking the "New Note" button
2. Use \[\[wikilinks\]\] to connect related notes
3. Organize with tags: #project #meeting #idea

## Tips

- Use \/ to search across all workspaces
- Drag and drop to reorganize
- Right-click for more options
`
      await fs.writeFile(readmePath, readmeContent, 'utf8')
    }
    
    return {
      id: workspaceName,
      name: workspaceName,
      created: Date.now(),
      lastOpenTime: Date.now(),
      sort: 0,
      writeFolderPath: workspacePath,
      opt: {}
    }
  }
  
  /**
   * Get workspace path
   */
  getWorkspacePath(workspaceName: string): string {
    if (this.isSystemFolder(workspaceName)) {
      const internalName = this.getSystemFolderInternalName(workspaceName)
      if (internalName) {
        return path.join(this.vaultPath, internalName)
      }
    }
    return path.join(this.vaultPath, workspaceName)
  }
  
  /**
   * Validate workspace name
   */
  validateWorkspaceName(name: string): { valid: boolean; message?: string } {
    if (this.isSystemFolder(name)) {
      return { valid: false, message: 'Cannot use system folder names for workspaces' }
    }
    
    if (!name.startsWith('@')) {
      return { valid: false, message: 'Workspace names must start with @' }
    }
    
    if (name.length < 2) {
      return { valid: false, message: 'Workspace name too short' }
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(name.substring(1))) {
      return { valid: false, message: 'Workspace names can only contain letters, numbers, underscores, and hyphens' }
    }
    
    return { valid: true }
  }
  
  /**
   * Binder management methods
   */
  
  /**
   * Validate binder name
   */
  validateBinderName(name: string): { valid: boolean; message?: string } {
    if (!name.startsWith('#')) {
      return { valid: false, message: 'Binder names must start with #' }
    }
    
    if (name.length < 2) {
      return { valid: false, message: 'Binder name too short' }
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(name.substring(1))) {
      return { valid: false, message: 'Binder names can only contain letters, numbers, underscores, and hyphens after #' }
    }
    
    // Check if binder name conflicts with system folders
    if (this.isSystemFolder(name)) {
      return { valid: false, message: 'Cannot use system folder names for binders' }
    }
    
    return { valid: true }
  }
  
  /**
   * Add a new binder
   */
  async addBinder(binderName: string, binderPath: string, options: {
    indexed?: boolean
    extractTasks?: boolean
    extractContacts?: boolean
  } = {}): Promise<{
    id: string
    name: string
    path: string
    indexed: boolean
    extractTasks: boolean
    extractContacts: boolean
  }> {
    const validation = this.validateBinderName(binderName)
    if (!validation.valid) {
      throw new Error(validation.message)
    }
    
    // Resolve the binder path
    let resolvedPath = binderPath
    if (binderPath.startsWith('~')) {
      resolvedPath = binderPath.replace('~', this.userDataPath)
    }
    
    // Check if path exists
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Binder path does not exist: ${binderPath}`)
    }
    
    // Check if binder already exists
    const binders = await this.getAllBinders()
    if (binders.some(b => b.name === binderName)) {
      throw new Error(`Binder with name ${binderName} already exists`)
    }
    
    return {
      id: binderName,
      name: binderName,
      path: resolvedPath,
      indexed: options.indexed !== undefined ? options.indexed : true,
      extractTasks: options.extractTasks !== undefined ? options.extractTasks : true,
      extractContacts: options.extractContacts !== undefined ? options.extractContacts : false
    }
  }
  
  /**
   * Get all binders
   */
  async getAllBinders(): Promise<Array<{
    id: string
    name: string
    path: string
    indexed: boolean
    extractTasks: boolean
    extractContacts: boolean
  }>> {
    // In a real implementation, this would read from settings.json
    // For now, return an empty array as we haven't implemented persistence yet
    return []
  }
  
  /**
   * Remove a binder
   */
  async removeBinder(/* binderId: string */): Promise<boolean> {
    // In a real implementation, this would remove from settings.json
    // For now, just return true
    return true
  }
  
  /**
   * Get binder by ID
   */
  async getBinder(binderId: string): Promise<{
    id: string
    name: string
    path: string
    indexed: boolean
    extractTasks: boolean
    extractContacts: boolean
  } | null> {
    const binders = await this.getAllBinders()
    return binders.find(b => b.id === binderId) || null
  }
  
  /**
   * Check if a path is a binder
   */
  async isBinderPath(binderPath: string): Promise<boolean> {
    const binders = await this.getAllBinders()
    return binders.some(b => b.path === binderPath)
  }
  
  private generateSystemFolderReadme(displayName: string, internalName: string): string {
    const descriptions: Record<string, string> = {
      '+inbox': 'Default capture location for new notes, imports, and quick ideas',
      '=feed': 'RSS/JSON feed imports and external content aggregation',
      '-outbox': 'Publishing queue and export pending items'
    }
    
    return `# ${displayName}

**System Folder** | **Internal**: \`${internalName}\` | **Icon**: ${this.systemFolderIcons[displayName]}

---

## Purpose

${descriptions[displayName] || 'System folder'}

## Rules

- Auto-created on first launch
- Cannot be deleted or renamed
- Location: \`${path.join(this.vaultPath, internalName)}\`
- Content is indexed automatically

## Usage

### +inbox
- Default location for new notes (Ctrl/Cmd + N)
- Import destination for files
- Quick capture from mobile/web

### =feed
- RSS feed imports
- JSON API content
- Web clippings
- Automated content

### -outbox
- Items ready for publishing
- Export queue
- Content awaiting review

## Best Practices

1. **Process regularly**: Review and organize content frequently
2. **Use workflows**: Move items from +inbox -> workspaces -> -outbox
3. **Automate**: Set up rules for automatic organization

---

*This is a system-managed folder. Do not modify folder properties.*
`
  }
  
  private getSystemFolderDescription(displayName: string): string {
    const descriptions: Record<string, string> = {
      '+inbox': 'Default capture location',
      '=feed': 'Feed imports and external content',
      '-outbox': 'Publishing queue'
    }
    return descriptions[displayName] || 'System folder'
  }
  
  private generateWelcomeContent(): string {
    return `# Welcome to Marksmith!

Thank you for choosing Marksmith - your vault-native markdown editor.

## Getting Started

### 1. Start with +inbox
- Press **Ctrl/Cmd + N** to create your first note
- It will automatically go to your **+inbox**
- Use this for quick capture and imports

### 2. Organize with Workspaces
- Create workspaces like **@project**, **@personal**, **@work**
- Drag notes between workspaces
- Use **@** prefix for workspace names

### 3. Publish from -outbox
- Move finished content to **-outbox**
- Review and export
- Share your work with the world

## Key Features

### System Flux Folders
- **+inbox** - Default capture
- **=feed** - External content
- **-outbox** - Publishing queue

### Workspaces
- Create with **@** prefix (e.g., @project, @personal)
- Each workspace has its own folder
- Switch easily from sidebar

### Universal Indexing
- Fast search across all content
- Tag-based organization
- Task management
- Backlink support

## Quick Tips

- **Search**: Press **/** to search anywhere
- **New Note**: **Ctrl/Cmd + N**
- **Switch Workspace**: Click workspace name in sidebar
- **Settings**: **Ctrl/Cmd + ,**

## Learn More

- [User Guide](https://marksmith.com/docs)
- [Keyboard Shortcuts](https://marksmith.com/shortcuts)
- [Advanced Features](https://marksmith.com/advanced)

---

**Happy writing!** 🚀
The Marksmith Team
`
  }
  
  private generateVaultReadme(): string {
    return `# Marksmith Vault

This is your **Master Vault** - the central repository for all your notes, ideas, and projects.

## Structure

\`\`\`
~/vault/
+-- +inbox/          # System: Default capture (displayed as +inbox)
+-- =feed/           # System: Feed imports (displayed as =feed)
+-- -outbox/         # System: Publishing queue (displayed as -outbox)
+-- @workspace/     # Your workspaces (e.g., @project, @personal)
+-- assets/          # Shared attachments and media
+-- templates/       # Note templates
+-- .marksmith/      # App state (do not modify)
+-- WELCOME.md       # This welcome guide
+-- README.md        # Vault overview
\`\`\`

## System Folders

### +inbox
- **Purpose**: Default capture location
- **Internal**: -inbox
- **Behavior**: New notes, imports, quick ideas

### =feed
- **Purpose**: External content aggregation
- **Internal**: =feed
- **Behavior**: RSS imports, API content, web clippings

### -outbox
- **Purpose**: Publishing queue
- **Internal**: -outbox
- **Behavior**: Items ready for export/sharing

## Workspaces

Create workspaces with **@** prefix:
- \`@project-alpha\` - Project-specific notes
- \`@personal\` - Personal journal and ideas
- \`@work\` - Work-related documents
- \`@research\` - Research materials

## Best Practices

1. **Capture Everything**: Use +inbox for all new content
2. **Organize Regularly**: Move items from +inbox to appropriate workspaces
3. **Use Tags**: #project #meeting #idea #todo
4. **Review Outbox**: Process -outbox items regularly
5. **Backup**: Regularly backup your vault

## Advanced

- **Templates**: Create reusable note templates in /templates/
- **Assets**: Store shared media in /assets/
- **Binders**: Use #hashtag prefixes for topic collections
- **Search**: Use / to search across all content

## Support

- **Documentation**: [marksmith.com/docs](https://marksmith.com/docs)
- **Community**: [marksmith.com/community](https://marksmith.com/community)
- **Issues**: [github.com/marksmith/issues](https://github.com/marksmith/issues)

---

*Last updated: ${new Date().toISOString()}*
`
  }
  
  /**
   * Get the file path for a document in the vault
   * @param docId Document ID
   * @param workspaceName Workspace name (with @ prefix)
   * @returns Full path to the document file
   */
  getDocumentPath(docId: string, workspaceName: string): string {
    const workspacePath = this.getWorkspacePath(workspaceName)
    return path.join(workspacePath, `${docId}.md`)
  }
  
  /**
   * Read document content from file
   * @param docId Document ID
   * @param workspaceName Workspace name (with @ prefix)
   * @returns Document content as string
   */
  async readDocumentContent(docId: string, workspaceName: string): Promise<string> {
    const filePath = this.getDocumentPath(docId, workspaceName)
    try {
      return await fs.readFile(filePath, 'utf8')
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error(`Document ${docId} not found in workspace ${workspaceName}`)
      }
      throw new Error(`Failed to read document ${docId}: ${error.message}`)
    }
  }
}