import { Form, Select, Input, Slider, Collapse, Checkbox } from 'antd'
import { useStore } from '@/store/store'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useGetSetState } from 'react-use'
import { openAiModels } from '@/store/llm/data/data'
import { CircleCheckBig, CircleX, Plug, Wifi, WifiOff } from 'lucide-react'
import { nid } from '@/utils/common'
import { observer } from 'mobx-react-lite'
import { Button, Modal } from '@lobehub/ui'

const FREE_MODELS = [
  'google/gemini-2.5-flash-preview-04-17:free',
  'deepseek/deepseek-chat:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
]

const ModalForm = observer((props: { open: boolean; id: string | null; onClose: () => void }) => {
  const [form] = Form.useForm()
  const store = useStore()
  const [state, setState] = useGetSetState({ loading: false, error: '', checking: false, checked: false })

  const check = useCallback(() => {
    form.validateFields().then((data) => {
      setState({ checking: true })
      store.chat.checkLLMApiConnection({ provider: 'openrouter', baseUrl: data.baseUrl, apiKey: data.apiKey, model: data.models[0], mode: 'openrouter' })
        .then((res) => setState(res.success ? { checked: true, error: '' } : { error: res.message, checked: false }))
        .finally(() => setState({ checking: false }))
    })
  }, [form])

  const save = useCallback(() => {
    const { models } = store.settings.state
    form.validateFields().then(async (data) => {
      const m: any = { name: data.name, mode: 'openrouter', baseUrl: data.baseUrl || 'https://openrouter.ai/api/v1', apiKey: data.apiKey, models: data.models, id: props.id, sort: data.sort || models.length }
      if (props.id) await store.model.updateClient(props.id, m); else { m.id = nid(); await store.model.createClient(m) }
      const t = models.find((x) => x.id === m.id)
      if (!t) { store.settings.setState((s) => { s.models = [...models, m] }); store.settings.setDefaultModel({ providerId: m.id, model: m.models[0] }) }
      else { await store.settings.getModels(); store.chat.setChatModel(m.id, store.chat.activeClient?.config.model || store.settings.state.defaultModel?.model || m.models[0]) }
      store.msg.success('Saved'); props.onClose()
    })
  }, [form, props.id])

  useEffect(() => {
    if (!props.open) return
    form.resetFields(); setState({ checked: false, error: '', loading: false, checking: false })
    if (props.id) {
      store.model.getClient(props.id).then((model) => {
        if (model) form.setFieldsValue({ name: model.name, mode: 'openrouter', baseUrl: model.baseUrl, apiKey: model.apiKey, models: model.models, sort: model.sort })
      })
    } else {
      form.setFieldsValue({ mode: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', models: FREE_MODELS, name: 'OpenRouter' })
    }
  }, [props.id, props.open])

  return (
    <Modal title="OpenRouter API" open={props.open} footer={null} width={500} onCancel={props.onClose} styles={{ wrapper: { zIndex: 2210 }, mask: { zIndex: 2200 } }}>
      <Form form={form} layout="vertical" labelAlign="right" size="middle">
        <Form.Item label="Name" name="name" rules={[{ required: true }]}><Input placeholder="My API config" /></Form.Item>
        <Form.Item label="Provider" name="mode" initialValue="openrouter"><Select disabled options={[{ label: 'OpenRouter', value: 'openrouter' }]} /></Form.Item>
        <Form.Item rules={[{ required: true }]} label="API Key" name="apiKey"><Input.Password placeholder="sk-or-v1-..." /></Form.Item>
        <Form.Item rules={[{ required: true, type: 'array' }]} label="Models" name="models">
          <Select mode="tags" dropdownStyle={{ zIndex: 2210 }} style={{ width: '100%' }} placeholder="Add model IDs" />
        </Form.Item>
        <Form.Item label="API Base URL" name="baseUrl"><Input placeholder="https://openrouter.ai/api/v1" /></Form.Item>
        <div className="flex justify-between items-center space-x-3">
          <div>
            {state().checked && <div className="flex items-center"><CircleCheckBig className="w-4 h-4 mr-2 text-green-500" />Connection OK</div>}
            {!state().checked && !!state().error && <div className="text-red-500 flex items-center"><CircleX className="w-4 h-4 mr-2 text-red-500" />{state().error || ''}</div>}
          </div>
          <div className="space-x-3 shrink-0 flex items-center">
            <Button type="default" size="middle" onClick={check} loading={state().checking}>Check</Button>
            <Button size="middle" onClick={save} loading={state().loading} type="primary">Save</Button>
          </div>
        </div>
      </Form>
    </Modal>
  )
})

const HivemindStatus = observer(() => {
  const [ok, setOk] = useState<boolean | null>(null)
  useEffect(() => {
    const check = async () => { try { const r: any = await (window as any).api?.ipc?.invoke?.('mcp:status'); setOk(r?.connected ?? false) } catch { setOk(false) } }
    check(); const i = setInterval(check, 5000); return () => clearInterval(i)
  }, [])
  return (
    <div className={'flex items-center justify-between p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-green-500/50 ' + (ok === true ? 'border-green-500/40 bg-green-500/5' : 'border-amber-500/40 bg-amber-500/5')}
      onClick={() => navigator.clipboard.writeText('cd ~/Code/OkAgentDigital/Hivemind && cargo run --release')} title={ok ? 'Hivemind running' : 'Copy start command'}>
      <div className="flex items-center gap-3">
        <Plug className="w-5 h-5 text-white/70" />
        <div><div className="text-sm font-medium">Hivemind Orchestrator</div><div className="text-xs text-white/50 mt-0.5">{ok === null ? 'Checking...' : ok ? 'Online' : 'Offline'}</div></div>
      </div>
      <div>{ok === null ? <div className="w-3 h-3 rounded-full bg-white/30 animate-pulse" /> : ok ? <Wifi className="w-5 h-5 text-green-400" /> : <WifiOff className="w-5 h-5 text-amber-400" />}</div>
    </div>
  )
})

export const ModelSettings = observer(() => {
  const store = useStore()
  const timer = useRef(0)
  const [st, setSt] = useGetSetState({ openEdit: false, selectedId: null as string | null })
  const m = store.settings.state.models
  const or = m.find((x) => x.mode === 'openrouter' || x.baseUrl?.includes('openrouter'))
  const upd = (k: keyof typeof store.settings.state) => { clearTimeout(timer.current); timer.current = window.setTimeout(() => store.settings.setSetting(k, store.settings.state[k]), 500) }
  return (
    <div className="py-5 max-w-140 mx-auto">
      <div className="mb-4">
        <Button block type="primary" size="large" className="h-14! text-base! rounded-xl!" onClick={() => setSt({ openEdit: true, selectedId: or?.id || null })}>
          <div className="flex items-center justify-center gap-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            OpenRouter{or ? <span className="text-xs opacity-60 font-normal ml-1">· {or.models?.length || 0} models</span> : null}
          </div>
        </Button>
        {or ? <p className="text-xs text-white/50 mt-1.5 text-center">{or.models?.slice(0, 3).join(', ')}{(or.models?.length || 0) > 3 ? ' ...' : ''}</p> : <p className="text-xs text-white/40 mt-1.5 text-center">Tap to configure with 3 free models pre-loaded</p>}
      </div>
      <HivemindStatus />
      <div className="mt-8">
        <Form className="w-full" layout="horizontal" labelAlign="left">
          <Form.Item label="Context Rounds" tooltip={{ title: 'Recent conversation rounds to include as context', styles: { root: { zIndex: 2210 } } }}>
            <div className="ml-5"><Slider min={4} max={20} onChange={(v) => { store.settings.setState((s) => { s.maxMessageRounds = v }); upd('maxMessageRounds') }} value={store.settings.state.maxMessageRounds} tooltip={{ zIndex: 2210, arrow: false }} /></div>
          </Form.Item>
          <Form.Item label="History Limit" tooltip={{ title: 'Max chat histories to keep', styles: { root: { zIndex: 2210 } } }}>
            <div className="ml-5"><Slider min={50} max={500} step={50} onChange={(v) => { store.settings.setState((s) => { s.maxHistoryChats = v }); upd('maxHistoryChats') }} value={store.settings.state.maxHistoryChats} tooltip={{ zIndex: 2210, arrow: false }} /></div>
          </Form.Item>
        </Form>
      </div>
      <div className="mt-5">
        <Collapse size="small" items={[{
          key: 'more', label: 'Sampling Parameters',
          children: (<div><div className="text-xs text-gray-500 mb-5 text-center">Fine-tune model output behavior</div>
            <Form layout="horizontal" className="w-full" labelAlign="left" size="small" labelCol={{ span: 14 }}>
              {[{ l: 'Temperature', k: 'temperature', mn: 0, mx: 2, st: 0.1, t: 'Controls randomness' },
                { l: 'Top P', k: 'top_p', mn: 0, mx: 1, st: 0.1, t: 'Nucleus sampling' },
                { l: 'Presence Penalty', k: 'presence_penalty', mn: -2, mx: 2, st: 0.1, t: 'Penalizes repeated tokens' },
                { l: 'Frequency Penalty', k: 'frequency_penalty', mn: -2, mx: 2, st: 0.1, t: 'Penalizes frequent tokens' },
              ].map(({ l, k, mn, mx, st, t }) => (
                <Form.Item key={k} label={l} tooltip={{ title: t, styles: { root: { zIndex: 2210 } } }}>
                  <div className="flex items-center">
                    <Slider min={mn} max={mx} value={(store.settings.state.modelOptions as any)[k].value} step={st} style={{ width: '120px' }} tooltip={{ zIndex: 2210 }}
                      onChange={(v) => { store.settings.setState((s) => { (s.modelOptions as any)[k].value = v }); upd('modelOptions') }} />
                    <div className="ml-5"><Checkbox checked={(store.settings.state.modelOptions as any)[k].enable}
                      onChange={(e) => { store.settings.setState((s) => { (s.modelOptions as any)[k].enable = e.target.checked }); upd('modelOptions') }} /></div>
                  </div>
                </Form.Item>
              ))}
            </Form></div>),
        }]} />
      </div>
      <ModalForm open={st().openEdit} id={st().selectedId} onClose={() => setSt({ openEdit: false, selectedId: null })} />
    </div>
  )
})
