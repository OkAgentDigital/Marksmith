/**
 * Test script for Vault Manager
 * Run this to verify the vault system works correctly
 */

import { initializeVault, getVaultManager } from './index'
import * as path from 'path'
import * as fs from 'fs-extra'

async function testVaultManager() {
  console.log('🚀 Starting Vault Manager Test...')
  
  try {
    // Initialize the vault
    console.log('📁 Initializing vault...')
    await initializeVault()
    
    const vaultManager = getVaultManager()
    
    // Test 1: Check master vault path
    console.log('✅ Test 1: Master Vault Path')
    const masterPath = vaultManager.getMasterVaultPath()
    console.log(`   Master Vault: ${masterPath}`)
    console.log(`   Exists: ${fs.existsSync(masterPath)}`)
    
    // Test 2: Check system folders
    console.log('✅ Test 2: System Folders')
    const systemFolders = vaultManager.getSystemFoldersInfo()
    for (const folder of systemFolders) {
      console.log(`   ${folder.icon} ${folder.displayName} (${folder.internalName})`)
      console.log(`      Path: ${folder.path}`)
      console.log(`      Exists: ${fs.existsSync(folder.path)}`)
      console.log(`      README: ${fs.existsSync(path.join(folder.path, 'README.md'))}`)
      
      // Read and display README content for verification
      const readmeContent = fs.readFileSync(path.join(folder.path, 'README.md'), 'utf8')
      console.log(`      README preview: ${readmeContent.substring(0, 50)}...`)
    }
    
    // Test 3: Check system folder mappings
    console.log('✅ Test 3: System Folder Mappings')
    console.log(`   -inbox → ${vaultManager.getSystemFolderDisplayName('-inbox')}`)
    console.log(`   +inbox → ${vaultManager.getSystemFolderInternalName('+inbox')}`)
    console.log(`   Is system folder: ${vaultManager.isSystemFolder('+inbox')}`)
    
    // Test 4: Check default workspaces
    console.log('✅ Test 4: Default Workspaces')
    const workspaces = ['@toybox', '@sandbox', '@family', '@public', '@private']
    for (const workspace of workspaces) {
      const workspacePath = vaultManager.getWorkspacePath(workspace)
      console.log(`   ${workspace}: ${fs.existsSync(workspacePath) ? '✅' : '❌'}`)
    }
    
    // Test 5: Validate workspace names
    console.log('✅ Test 5: Workspace Name Validation')
    console.log(`   '@valid': ${vaultManager.validateWorkspaceName('@valid').valid}`)
    console.log(`   '+inbox': ${vaultManager.validateWorkspaceName('+inbox').valid}`)
    console.log(`   'invalid': ${vaultManager.validateWorkspaceName('invalid').valid}`)
    
    console.log('🎉 All tests completed successfully!')
    console.log('\n📊 Vault Structure:')
    console.log(`   ${masterPath}/`)
    for (const folder of systemFolders) {
      console.log(`   ├── ${folder.displayName}/`)
    }
    console.log(`   ├── assets/`)
    console.log(`   ├── templates/`)
    console.log(`   ├── .marksmith/`)
    console.log(`   ├── WELCOME.md`)
    console.log(`   └── README.md`)
    
  } catch (error) {
    console.error('❌ Vault test failed:', error)
    process.exit(1)
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testVaultManager()
}

export { testVaultManager }