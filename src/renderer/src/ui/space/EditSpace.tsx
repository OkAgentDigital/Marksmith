import { observer } from 'mobx-react-lite'
import { CloseCircleOutlined, FolderOpenOutlined, SaveOutlined } from '@ant-design/icons'
import { useCallback } from 'react'
import { runInAction } from 'mobx'
import { useStore } from '@/store/store'
import { useLocalState } from '@/hooks/useLocalState'
import { ISpace } from 'types/model'
import { useSubject } from '@/hooks/common'
import { nid } from '@/utils/common'
import { IWorkspace } from '@/icons/IWorkspace'
import { Space, Form, Input, Modal, Collapse, Button, Select } from 'antd'
import { useTranslation } from 'react-i18next'

export const EditSpace = observer(() => {
  const { t } = useTranslation()
  const store = useStore()
  const [state, setState] = useLocalState({
    open: false,
    spaceId: '',
    filePath: '',
    spaceName: '',
    vaultLocation: '~/vault/',
    inputDeleteName: '',
    submitting: false,
    space: null as null | ISpace,
    startWriting: false
  })

  useSubject(store.note.openEditSpace$, (spaceId) => {
    if (spaceId) {
      store.model.getSpace({ id: spaceId }).then((res) => {
        setState({
          space: res,
          spaceName: res?.name,
          spaceId,
          filePath: res?.writeFolderPath || '',
          open: true,
          inputDeleteName: '',
          startWriting: false
        })
      })
    } else {
      setState({
        open: true,
        spaceId: '',
        spaceName: '',
        filePath: '',
        space: null,
        inputDeleteName: '',
        startWriting: false
      })
    }
  })

  const validatePath = useCallback(async (filePath: string, spaceId?: string) => {
    const includeSpace = await store.model.getSpace({ writeFolderPath: filePath })
    if (includeSpace && (!spaceId || includeSpace.id !== spaceId)) {
      return false
    }
    return true
  }, [])

  const save = useCallback(async () => {
    // Auto-set writeFolderPath for special directories
    let finalFilePath = state.filePath
    const specialDirs = ['@inbox', '@toybox', '@sandbox', '@public', '@private', '@outbox']
    if (specialDirs.includes(state.spaceName) && !finalFilePath) {
      // Use the selected vault location
      const vaultPath = state.vaultLocation.replace('~', window.api.userDataPath())
      finalFilePath = window.api.path.join(vaultPath, state.spaceName)
    }
    
    if (finalFilePath && !(await validatePath(finalFilePath, state.spaceId))) {
      store.msg.open({
        type: 'info',
        content: t('workspace.directoryUsed')
      })
      return
    }
    if (state.space) {
      await store.model.updateSpace(state.space.id, {
        name: state.spaceName,
        writeFolderPath: finalFilePath
      })
      if (state.spaceId === store.note.state.currentSpace?.id) {
        runInAction(() => {
          store.note.state.currentSpace!.name = state.spaceName
          store.note.state.currentSpace!.writeFolderPath = finalFilePath
        })
      }
      setState({ open: false })
    } else {
      const exist = await store.model.getSpace({
        name: state.spaceName,
        writeFolderPath: finalFilePath
      })
      if (exist) {
        if (exist.name === state.spaceName) {
          store.msg.open({
            type: 'info',
            content: t('workspace.nameExists')
          })
        }
        if (finalFilePath && exist.writeFolderPath === finalFilePath) {
          store.msg.open({
            type: 'info',
            content: t('workspace.directoryUsed')
          })
        }
      } else {
        try {
          const id = nid()
          const now = Date.now()
          await store.model.createSpace({
            id,
            name: state.spaceName,
            writeFolderPath: finalFilePath,
            sort: 0,
            created: now,
            lastOpenTime: now
          })
          store.note.init(id)
          setState({ open: false })
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [])
  return (
    <Modal
      open={state.open}
      footer={null}
      width={400}
      title={
        <div className={'flex items-center'}>
          <IWorkspace className={'mr-1 text-lg'} />
          <span className={'text-sm'}>{t('workspaceSettings')}</span>
        </div>
      }
      onCancel={() => setState({ open: false })}
    >
      <div className={'py-3'}>
        <Form layout={'vertical'}>
          <Form.Item label={t('workspace.name')}>
            <Select
              placeholder="Select workspace name"
              value={state.spaceName}
              onChange={(value) => setState({ spaceName: value })}
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <div className="h-[1px] my-1 bg-gray-200/70 dark:bg-gray-100/10"></div>
                  <div className="px-3 py-1 text-xs font-medium text-gray-500">{t('workspace.vaultLocations')}</div>
                  <div
                    onClick={async () => {
                      const result = await window.api.showOpenDialog({
                        properties: ['openDirectory'],
                        title: t('workspace.selectFolder')
                      });
                      if (!result.canceled && result.filePaths.length > 0) {
                        setState({ spaceName: result.filePaths[0] });
                      }
                    }}
                    className="flex items-center h-8 px-3 duration-200 dark:hover:bg-gray-200/10 hover:bg-gray-100 cursor-pointer rounded text-sm"
                  >
                    <FolderOpenOutlined className="mr-2" />
                    <span>{t('workspace.openFolder')}</span>
                  </div>
                </div>
              )}
              options={[
                { value: '@inbox', label: '@inbox' },
                { value: '@toybox', label: '@toybox' },
                { value: '@sandbox', label: '@sandbox' },
                { value: '@public', label: '@public' },
                { value: '@private', label: '@private' },
                { value: '@outbox', label: '@outbox' }
              ]}
            />
          </Form.Item>
          <Form.Item label={t('workspace.vaultLocations')}>
            <Select
              value={state.vaultLocation}
              onChange={(value) => setState({ vaultLocation: value })}
              options={[
                { value: '~/vault/', label: 'MD Vault (~/vault/)' },
                { value: '~/code-vault/', label: 'CODE Vault (~/code-vault/)' }
              ]}
            />
          </Form.Item>

          <div className={'space-y-3'}>
            {!state.spaceId && (
              <Button
                block={true}
                type={'primary'}
                onClick={save}
                disabled={!state.spaceName}
                loading={state.submitting}
              >
                {t('create')}
              </Button>
            )}
            {!!state.space && (
              <Collapse
                size={'small'}
                className={'select-none'}
                items={[
                  {
                    key: 'delete',
                    label: 'More',
                    children: (
                      <div>
                        {store.note.state.spaces.length > 1 && (
                          <Input
                            placeholder={t('workspace.enterName')}
                            value={state.inputDeleteName}
                            onChange={(e) => setState({ inputDeleteName: e.target.value })}
                          />
                        )}
                        <Button
                          type={'primary'}
                          danger={true}
                          block={true}
                          className={'mt-4'}
                          onClick={() => {
                            store.note.openConfirmDialog$.next({
                              title: t('workspace.confirmDelete'),
                              okText: t('workspace.delete'),
                              onConfirm: async () => {
                                await store.model.deleteSpace(state.space!.id)
                                store.note.setState((draft) => {
                                  draft.spaces = draft.spaces.filter(
                                    (s) => s.id !== state.space!.id
                                  )
                                  store.note.selectSpace(draft.spaces[0].id)
                                })
                                setState({ open: false })
                                store.msg.success(t('workspace.deleted'))
                              }
                            })
                          }}
                          disabled={
                            state.inputDeleteName !== state.space.name ||
                            store.note.state.spaces.length === 1
                          }
                        >
                          {t('workspace.delete')}
                        </Button>
                        <div
                          className={
                            'text-xs text-center mt-4 text-black/70 dark:text-white/70 px-10'
                          }
                        >
                          {store.note.state.spaces.length > 1
                            ? t('workspace.deleteHint')
                            : t('workspace.minSpaceHint')}
                        </div>
                      </div>
                    )
                  }
                ]}
              />
            )}
          </div>
        </Form>
      </div>
    </Modal>
  )
})