import React, { useState, useEffect } from 'react'
import { Modal, Input, Button, List, Popover, message, Divider, Typography, Space, Tooltip } from 'antd'
import { FolderOpenOutlined, PlusOutlined, DeleteOutlined, InfoCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useStore } from '@/store/store'
import { observer } from 'mobx-react-lite'

const { Text } = Typography

export const WorkspaceSettingsPopover: React.FC<{
  visible: boolean
  onClose: () => void
}> = observer(({ visible, onClose }) => {
  const store = useStore()
  
  // State for workspace settings
  const [vaultPath, setVaultPath] = useState<string>('~/vault/')
  const [workspaces, setWorkspaces] = useState<string[]>([])
  const [binders, setBinders] = useState<Array<{
    id: string
    name: string
    path: string
  }>>([])
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>('')
  const [newBinderName, setNewBinderName] = useState<string>('#')
  const [newBinderPath, setNewBinderPath] = useState<string>('')
  const [showAddWorkspace, setShowAddWorkspace] = useState<boolean>(false)
  const [showAddBinder, setShowAddBinder] = useState<boolean>(false)
  const [showVaultChangeWarning, setShowVaultChangeWarning] = useState<boolean>(false)
  
  // System folders info (read-only)
  const systemFolders = [
    { name: '+inbox', icon: '📥', description: 'Incoming notes and drafts' },
    { name: '=feed', icon: '📡', description: 'Processed notes ready for review' },
    { name: '-outbox', icon: '📤', description: 'Completed notes ready for export' }
  ]
  
  // Load current settings
  useEffect(() => {
    if (visible) {
      // Load from store/settings in a real implementation
      // For now, use default values
      setVaultPath('~/vault/')
      setWorkspaces(['@toybox', '@sandbox', '@family', '@public', '@private'])
      setBinders([
        { id: '#client-acme', name: '#client-acme', path: '~/Documents/client-acme/' },
        { id: '#personal-blog', name: '#personal-blog', path: '~/Documents/blog/' }
      ])
    }
  }, [visible])
  
  const handleAddWorkspace = () => {
    if (!newWorkspaceName.startsWith('@')) {
      message.error({ content: 'Workspace names must start with @' })
      return
    }
    
    if (workspaces.includes(newWorkspaceName)) {
      message.error({ content: 'Workspace already exists' })
      return
    }
    
    setWorkspaces([...workspaces, newWorkspaceName])
    setNewWorkspaceName('')
    setShowAddWorkspace(false)
    message.success({ content: 'Workspace added successfully' })
  }
  
  const handleRemoveWorkspace = (workspaceName: string) => {
    if (workspaces.length <= 1) {
      message.error({ content: 'At least one workspace is required' })
      return
    }
    
    setWorkspaces(workspaces.filter(w => w !== workspaceName))
    message.success({ content: 'Workspace removed successfully' })
  }
  
  const handleAddBinder = () => {
    if (!newBinderName.startsWith('#')) {
      message.error({ content: 'Binder names must start with #' })
      return
    }
    
    if (binders.some(b => b.name === newBinderName)) {
      message.error({ content: 'Binder already exists' })
      return
    }
    
    const newBinder = {
      id: newBinderName,
      name: newBinderName,
      path: newBinderPath
    }
    
    setBinders([...binders, newBinder])
    setNewBinderName('#')
    setNewBinderPath('')
    setShowAddBinder(false)
    message.success({ content: 'Binder added successfully' })
  }
  
  const handleRemoveBinder = (binderId: string) => {
    setBinders(binders.filter(b => b.id !== binderId))
    message.success({ content: 'Binder removed successfully' })
  }
  
  const handleVaultPathChange = () => {
    setShowVaultChangeWarning(true)
  }
  
  const handleConfirmVaultChange = () => {
    // In a real implementation, this would:
    // 1. Update settings
    // 2. Reset the index database
    // 3. Refresh the sidebar
    setShowVaultChangeWarning(false)
    message.success({ content: 'Vault location updated successfully' })
  }
  
  const handleSave = () => {
    // Save all settings
    // In a real implementation, this would persist to settings.json
    message.success({ content: 'Settings saved successfully' })
    onClose()
  }
  
  return (
    <Modal
      title={
        <div className="flex items-center">
          <FolderOpenOutlined className="mr-2" />
          <span>Workspace Settings</span>
        </div>
      }
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>
      ]}
      width={600}
    >
      <div className="space-y-6">
        {/* Vault Location Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Text strong>Vault Location</Text>
            <Tooltip title="Set the root folder for all your notes and content">
              <InfoCircleOutlined className="text-gray-400" />
            </Tooltip>
          </div>
          <div className="flex gap-2">
            <Input
              value={vaultPath}
              onChange={(e) => setVaultPath(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleVaultPathChange}>
              Browse
            </Button>
          </div>
          <div className="mt-2 p-2 bg-yellow-50 rounded">
            <Text type="warning" className="text-xs">
              <ExclamationCircleOutlined className="mr-1" />
              Changing vault location will reset your index database and require re-indexing all content
            </Text>
          </div>
        </div>
        
        <Divider />
        
        {/* Workspaces Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Text strong>Workspaces</Text>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => setShowAddWorkspace(true)}
              size="small"
            >
              Add Workspace
            </Button>
          </div>
          
          <List
            dataSource={workspaces}
            renderItem={(workspace) => (
              <List.Item
                actions={[
                  workspaces.length > 1 ? (
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveWorkspace(workspace)}
                    />
                  ) : null
                ]}
              >
                <List.Item.Meta
                  title={workspace}
                  description={`Location: ${vaultPath}/${workspace}`}
                />
              </List.Item>
            )}
          />
        </div>
        
        <Divider />
        
        {/* Binders Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Text strong>Binders</Text>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => setShowAddBinder(true)}
              size="small"
            >
              Add Binder
            </Button>
          </div>
          
          <List
            dataSource={binders}
            renderItem={(binder) => (
              <List.Item
                actions={[
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveBinder(binder.id)}
                  />
                ]}
              >
                <List.Item.Meta
                  title={binder.name}
                  description={
                    <div>
                      <Text type="secondary" className="text-xs">
                        {binder.path}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
        
        <Divider />
        
        {/* System Folders Section */}
        <div>
          <Text strong>System Folders</Text>
          <div className="mt-2 flex gap-4">
            {systemFolders.map((folder) => (
              <div key={folder.name} className="text-center p-2 bg-gray-50 rounded">
                <div className="text-2xl mb-1">{folder.icon}</div>
                <div className="font-medium">{folder.name}</div>
                <div className="text-xs text-gray-500 mt-1">{folder.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Add Workspace Modal */}
      <Modal
        title="Add Workspace"
        visible={showAddWorkspace}
        onCancel={() => setShowAddWorkspace(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowAddWorkspace(false)}>
            Cancel
          </Button>,
          <Button key="add" type="primary" onClick={handleAddWorkspace}>
            Add
          </Button>
        ]}
      >
        <div className="space-y-4">
          <div>
            <Text strong>Workspace Name</Text>
            <Input
              placeholder="@project"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              className="mt-2"
            />
            <Text type="secondary" className="text-xs block mt-1">
              Workspace names must start with @ (e.g., @project, @personal)
            </Text>
          </div>
        </div>
      </Modal>
      
      {/* Add Binder Modal */}
      <Modal
        title="Add Binder"
        visible={showAddBinder}
        onCancel={() => setShowAddBinder(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowAddBinder(false)}>
            Cancel
          </Button>,
          <Button key="add" type="primary" onClick={handleAddBinder}>
            Add
          </Button>
        ]}
      >
        <div className="space-y-4">
          <div>
            <Text strong>Binder Name</Text>
            <Input
              placeholder="#client-project"
              value={newBinderName}
              onChange={(e) => setNewBinderName(e.target.value)}
              className="mt-2"
            />
            <Text type="secondary" className="text-xs block mt-1">
              Binder names must start with # (e.g., #client-project, #personal-blog)
            </Text>
          </div>
          
          <div>
            <Text strong>Binder Location</Text>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="/Users/name/Documents/project"
                value={newBinderPath}
                onChange={(e) => setNewBinderPath(e.target.value)}
                className="flex-grow"
              />
              <Button>
                Browse
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      
      {/* Vault Change Confirmation */}
      <Modal
        title="Confirm Vault Change"
        visible={showVaultChangeWarning}
        onCancel={() => setShowVaultChangeWarning(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowVaultChangeWarning(false)}>
            Cancel
          </Button>,
          <Button key="confirm" type="primary" danger onClick={handleConfirmVaultChange}>
            Confirm
          </Button>
        ]}
      >
        <div className="space-y-4">
          <div>
            <Text strong>Current Vault</Text>
            <Text code className="block mt-1">~/vault/</Text>
          </div>
          
          <div>
            <Text strong>New Vault</Text>
            <Text code className="block mt-1">{vaultPath}</Text>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded">
            <Text type="warning">
              <ExclamationCircleOutlined className="mr-1" />
              Changing the vault location will reset your index database and require re-indexing all content. This may take some time depending on the size of your vault.
            </Text>
          </div>
        </div>
      </Modal>
    </Modal>
  )
})

export default WorkspaceSettingsPopover