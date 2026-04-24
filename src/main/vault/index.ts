import { VaultManager } from './vaultManager'

let vaultManager: VaultManager | null = null

export function getVaultManager(): VaultManager {
  if (!vaultManager) {
    vaultManager = new VaultManager()
  }
  return vaultManager
}

export async function initializeVault(): Promise<VaultManager> {
  const manager = getVaultManager()
  await manager.initialize()
  return manager
}

export * from './vaultManager'