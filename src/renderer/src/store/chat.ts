import { escapeBrackets, escapeMhchem, fixMarkdownBold } from '@/ui/markdown/utils'
import { nid } from '@/utils/common'
import { observable, runInAction, toJS } from 'mobx'
import { Subject } from 'rxjs'
import { createEditor } from 'slate'
import { withHistory } from 'slate-history'
import { withReact } from 'slate-react'
import { IChat, IMessage, IMessageDoc, IMessageFile, IMessageModel } from 'types/model'
import { getTokens } from '../utils/ai'
import { AiClient } from './llm/client'
import { openAiModels } from './llm/data/data'
import { ClientModel } from './settings'
import { Store } from './store'
import { StructStore } from './struct'

const state = {
  chats: [] as IChat[],
  activeChat: null as null | IChat,
  webSearch: false,
  docContext: false,
  refresh: false,
  openSearch: false,
  cacheDocs: [] as IMessageDoc[],
  reference: {
    open: false,
    keyword: '',
    domRect: null as null | DOMRect
  }
}
export class ChatStore extends StructStore<typeof state> {
  private maxTokens = 32000
  editor = withReact(withHistory(createEditor()))
  // 触发压缩的阈值
  private warningThreshold = 25000
  private minRetainMessages = 8 // 最少保留的消息数
  private recentMessagesCount = 6 // 保留最近的消息数
  activeClient: AiClient | null = null
  writeClient: AiClient | null = null
  private chatAbort = new Map<string, AbortController>()
  generateTopicChat = new Set<string>()
  scrollToActiveMessage$ = new Subject<void>()
  modelChange$ = new Subject<void>()
  constructor(private readonly store: Store) {
    super(state)
    this.init()
  }
  init() {
    this.store.model.getChats().then((chats) => {
      this.setState((state) => {
        state.chats = chats
      })
    })
    // 监听窗口关闭事件，停止所有处于pending状态的聊天
    window.addEventListener('beforeunload', () => {
      // 直接从chatAbort映射中获取所有需要中止的控制器
      this.chatAbort.forEach((controller, chatId) => {
        this.stopCompletion(chatId)
      })
      this.chatAbort.clear()
    })
  }
  refresh() {
    this.setState((state) => {
      state.refresh = !state.refresh
    })
  }
  async createChat(id?: string) {
    let obj: IChat | null = null
    const now = Date.now()
    if (id) {
      const chat = await this.store.model.getChat(id)
      if (chat) {
        obj = {
          id: chat.id,
          created: chat.created,
          updated: chat.updated,
          messages: chat.messages || [],
          clientId: chat.clientId,
          model: chat.model,
          websearch: chat.websearch,
          docContext: chat.docContext
        }
      }
    }
    if (!obj) {
      obj = {
        id: nid(),
        messages: [],
        created: now,
        updated: now,
        pending: true,
        websearch: this.state.webSearch,
        docContext: this.state.docContext
      }
    }

    const model = this.store.settings.getAvailableUseModel(obj?.clientId, obj?.model)
    if (model) {
      this.refreshClient(model)
      obj.model = model.model
      obj.clientId = model.id
      this.store.model.updateChat(obj!.id, {
        model: model.model,
        clientId: model.id,
        websearch: obj.websearch,
        docContext: obj.docContext
      })
    }
    if (!id) {
      await this.store.model.createChat(obj!)
      this.setState((state) => {
        state.chats.unshift(obj!)
      })
      const chats = this.store.chat.state.chats.length
      if (chats > this.store.settings.state.maxHistoryChats) {
        this.store.model.deleteChat(this.store.chat.state.chats[chats - 1].id)
        this.setState((state) => {
          state.chats.pop()
        })
      }
    }
    this.setState({ activeChat: obj! })
    return obj!
  }

  setChatModel(id: string, model: string) {
    const { models } = this.store.settings.state
    const activeChat = this.state.activeChat
    const config = models.find((item) => item.id === id)
    let useModel = model
    if (config && this.activeClient) {
      useModel = config.models.includes(model) ? model : config.models[0]
      this.activeClient = new AiClient({
        model: useModel,
        mode: config.mode,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl || openAiModels.get(config.mode),
        id: id,
        options: config.options
      })
      if (activeChat) {
        this.setState((state) => {
          if (state.activeChat) {
            state.activeChat.model = useModel
            state.activeChat.clientId = id
            this.store.model.updateChat(state.activeChat.id, {
              model: useModel,
              clientId: id
            })
          }
        })
      }
    }
    this.store.settings.setDefaultModel({ providerId: id, model: useModel })
  }

  private refreshClient(model?: ClientModel) {
    if (
      model?.id !== this.activeClient?.config.id ||
      model?.model !== this.activeClient?.config.model
    ) {
      if (model) {
        this.activeClient = new AiClient({
          model: model.model,
          mode: model.mode,
          apiKey: model.apiKey,
          baseUrl: model.baseUrl || openAiModels.get(model.mode),
          id: model.id,
          options: model.options
        })
      }
    }
  }
  async stopCompletion(id: string) {
    const controller = this.chatAbort.get(id)
    if (controller) {
      controller.abort()
      this.chatAbort.delete(id)
      this.setState((state) => {
        state.activeChat!.pending = false
        state.activeChat!.updated = Date.now()
        const msg = state.activeChat!.messages![state.activeChat!.messages!.length - 1]
        msg.content = msg.content === '...' ? '' : msg.content
        msg.terminated = true
        const tokens = getTokens(msg.content || '')
        localStorage.removeItem(`chunk-${msg.id}`)
        this.store.model.updateMessage(msg.id, {
          tokens: tokens,
          updated: Date.now(),
          terminated: true,
          content: msg.content
        })
      })
    }
  }
  updateChat(id: string, chat: Partial<IChat>) {
    this.store.model.updateChat(id, chat)
    this.setState((state) => {
      if (state.activeChat?.id === id) {
        state.activeChat = {
          ...state.activeChat,
          ...chat
        }
      }
      state.chats = state.chats.sort((a, b) => b.updated - a.updated)
    })
  }
  async regenrate() {
    const { activeChat } = this.state
    if (activeChat) {
      const aiMsg = activeChat?.messages![activeChat?.messages!.length - 1]
      this.setState((state) => {
        state.activeChat!.pending = true
        state.activeChat!.messages?.pop()
      })
      const sendMessages = await this.getHistoryMessages(this.state.activeChat!)
      this.setState((state) => {
        const msg = {
          ...aiMsg,
          tokens: 0,
          reasoning: undefined,
          terminated: false,
          error: undefined,
          content: '...'
        }
        state.activeChat!.messages!.push(msg)
        this.store.model.updateMessage(msg.id, msg)
      })
      this.scrollToActiveMessage$.next()
      this.startCompletion(activeChat, sendMessages)
    }
  }
  async completion(
    text: string,
    opts?: {
      files?: IMessageFile[]
      images?: IMessageFile[]
    },
    lastUserMsg?: IMessage
  ) {
    const now = Date.now()
    let { activeChat } = this.state
    if (!activeChat) {
      activeChat = await this.createChat()
    }
    const model = this.store.settings.getAvailableUseModel(activeChat.clientId, activeChat.model)
    if (!model) {
      return
    }
    if (!this.activeClient) {
      this.refreshClient(model)
    }
    let tokens = getTokens(text)
    if (opts?.files) {
      tokens += opts.files.reduce((acc, f) => acc + getTokens(f.content || ''), 0)
    }
    if (activeChat.messages?.[activeChat.messages.length - 1]?.error) {
      const lastChat = activeChat!.messages!.slice(-2)
      this.store.model.deleteMessages(lastChat.map((m) => m.id))
      this.setState((state) => {
        state.activeChat!.messages = state.activeChat!.messages!.slice(0, -2)
      })
    }
    const userMsg: IMessage =
      lastUserMsg ||
      observable({
        chatId: activeChat!.id,
        created: now,
        updated: now,
        role: 'user',
        id: nid(),
        content: text,
        files: opts?.files,
        images: opts?.images,
        docs: this.state.cacheDocs.length ? this.state.cacheDocs.slice() : undefined,
        tokens: tokens
      })
    this.setState((state) => {
      if (activeChat.id !== state.activeChat?.id) {
        state.activeChat = activeChat
      }
      state.activeChat.pending = true
      state.activeChat.messages?.push(userMsg)
      state.cacheDocs = []
    })
    const msgId = nid()
    const aiMsg: IMessage = {
      chatId: activeChat!.id,
      created: now + 100,
      updated: now + 100,
      role: 'assistant',
      id: msgId,
      content: '...',
      tokens: 0,
      model: activeChat.model!
    }
    this.setState((state) => {
      state.activeChat!.messages!.push(aiMsg)
    })

    if (activeChat.docContext) {
      try {
        const res = await this.store.model.fetchSpaceContext(
          text,
          this.store.note.state.currentSpace?.id!
        )
        runInAction(() => {
          if (res?.ctx?.length) {
            const docs = res.ctx
              .map((c) => {
                return { doc: this.store.note.state.nodes[c.docId], text: c.text }
              })
              .filter((d) => !!d.doc)
            if (docs.length) {
              userMsg.context = docs.map((d) => ({
                name: d.doc.name,
                content: d.text,
                id: d.doc.id
              }))
            }
          }
          if (!userMsg.context) {
            userMsg.context = [
              {
                name: 'System',
                content:
                  'The system did not find the corresponding context note. Can you remind me to describe it more accurately?',
                id: 'system'
              }
            ]
          }
        })
      } catch (e) {
        console.error(e)
      }
    }
    this.refresh()
    this.scrollToActiveMessage$.next()
    this.store.model.createMessages([toJS(userMsg), toJS(aiMsg)]).then(() => {
      if (userMsg.images?.length) {
        this.store.model.createFiles(
          userMsg.images.map((i) => ({
            name: i.id,
            size: i.size,
            messageId: userMsg.id,
            created: now
          }))
        )
      }
    })
    const sendMessages = await this.getHistoryMessages(this.state.activeChat!)
    this.startCompletion(activeChat, sendMessages)
  }
  /** Parse tool call JSON from AI response content.
   *  Handles: embedded text, single quotes, code blocks, markdown wrapping. */
  private parseToolCalls(content: string): { tool: string; arguments: Record<string, any> }[] {
    // Normalize single quotes to double quotes for JSON parsing
    const normalize = (s: string) => s.replace(/'/g, '"').replace(/(\w+):/g, '"$1":')

    const candidates: string[] = []

    // 1. Try to find a JSON array anywhere in the text: [...]
    const arrayMatch = content.match(/\[[\s\S]*?\]/)
    if (arrayMatch) candidates.push(arrayMatch[0])

    // 2. Try markdown code blocks (```json ... ```)
    const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
    if (codeBlockMatch) candidates.push(codeBlockMatch[1])

    // Try each candidate
    for (const raw of candidates) {
      // Try as-is first
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          const tools = parsed.filter(
            (item: any) => item?.type === 'tool' && item?.tool && item?.arguments
          )
          if (tools.length) return tools
        }
      } catch {
        // Fall through to normalized version
      }
      // Try with normalized quotes
      try {
        const parsed = JSON.parse(normalize(raw))
        if (Array.isArray(parsed)) {
          const tools = parsed.filter(
            (item: any) => item?.type === 'tool' && item?.tool && item?.arguments
          )
          if (tools.length) return tools
        }
      } catch {
        // Not valid — try next candidate
      }
    }
    return []
  }

  /** Execute a single MCP tool call via window.mcp */
  private async executeToolCall(
    tool: string,
    args: Record<string, any>
  ): Promise<{ tool: string; result: string; error?: string }> {
    try {
      const mcp = window.mcp
      let result: any
      switch (tool) {
        case 'vault_read':
          result = await mcp.read(args.path)
          break
        case 'vault_write':
          await mcp.write(args.path, args.content)
          result = `Successfully wrote to ${args.path}`
          break
        case 'vault_search':
          result = await mcp.search(args.query, args.limit)
          break
        case 'vault_list':
          result = await mcp.list(args.path)
          break
        case 'vault_summarize':
          result = await mcp.summarize(args.path)
          break
        case 'vault_batch_tag':
          await mcp.batchTag(args.tag, args.pattern)
          result = `Successfully applied tag "${args.tag}" to files matching "${args.pattern}"`
          break
        default:
          return { tool, result: '', error: `Unknown tool: ${tool}` }
      }
      const resultStr = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
      return { tool, result: resultStr }
    } catch (err: any) {
      return { tool, result: '', error: err?.message || String(err) }
    }
  }

  private async startCompletion(activeChat: IChat, sendMessages: IMessageModel[], toolRound = 0) {
    const controller = new AbortController()
    this.chatAbort.set(activeChat.id, controller)
    const startTime = Date.now()
    let lastUpdate = Date.now()
    const modelOptions = this.store.settings.state.modelOptions
    const maxToolRounds = 8
    this.activeClient!.completionStream(sendMessages, {
      enable_search: activeChat.websearch,
      modelOptions: {
        temperature: modelOptions.temperature.enable ? modelOptions.temperature.value : undefined,
        top_p: modelOptions.top_p.enable ? modelOptions.top_p.value : undefined,
        presence_penalty: modelOptions.presence_penalty.enable
          ? modelOptions.presence_penalty.value
          : undefined,
        frequency_penalty: modelOptions.frequency_penalty.enable
          ? modelOptions.frequency_penalty.value
          : undefined
      },
      onChunk: (fullText) => {
        this.setState((state) => {
          const msg = state.activeChat!.messages![state.activeChat!.messages!.length - 1]
          if (msg.terminated) {
            return
          }
          if (msg.reasoning && !msg.duration) {
            msg.duration = Date.now() - startTime
            this.store.model.updateMessage(msg.id, {
              duration: msg.duration,
              reasoning: msg.reasoning
            })
          }
          // Throttle content updates to reduce state updates
          const now = Date.now()
          const throttleInterval = 20
          if (now - lastUpdate >= throttleInterval) {
            msg.content = fixMarkdownBold(escapeMhchem(escapeBrackets(fullText)))
            lastUpdate = now
            localStorage.setItem(`chunk-${msg.id}`, fullText)
          }
        })
      },
      onReasoning: (reasoning) => {
        this.setState((state) => {
          const msg = state.activeChat!.messages![state.activeChat!.messages!.length - 1]
          if (msg.terminated) {
            return
          }
          msg.reasoning = fixMarkdownBold(escapeMhchem(escapeBrackets(reasoning)))
        })
      },
      onError: (code, message, e) => {
        console.error(e)
        const now = Date.now()
        this.chatAbort.delete(activeChat.id)
        this.setState((state) => {
          state.activeChat!.pending = false
          state.activeChat!.updated = Date.now()
          const msg = state.activeChat!.messages![state.activeChat!.messages!.length - 1]
          msg.content = msg.content === '...' ? '' : msg.content
          msg.error = {
            code,
            message
          }
          this.updateChat(activeChat.id, {
            updated: now
          })
          this.store.model.updateMessage(msg.id, {
            updated: now,
            error: {
              code,
              message
            }
          })
        })
        this.refresh()
      },
      onFinish: async (content: string = '') => {
        console.log('onFinish', content, 'toolRound', toolRound)
        const toolCalls = this.parseToolCalls(content)

        // If tool calls detected and under max rounds, execute and loop back
        if (toolCalls.length > 0 && toolRound < maxToolRounds) {
          // Show tool usage in the message
          const toolNames = toolCalls.map((tc) => tc.tool).join(', ')
          this.setState((state) => {
            const msg = state.activeChat!.messages![state.activeChat!.messages!.length - 1]
            msg.content = `🔧 Using tools: ${toolNames}...`
          })

          // Execute all tool calls in parallel
          const results = await Promise.all(
            toolCalls.map((tc) => this.executeToolCall(tc.tool, tc.arguments))
          )

          // Build tool result messages
          const toolResultParts = results
            .map((r) => {
              if (r.error) {
                return `Tool "${r.tool}" error: ${r.error}`
              }
              return `Tool "${r.tool}" result:\n${r.result}`
            })
            .join('\n\n')

          const updatedMessages: IMessageModel[] = [
            ...sendMessages,
            { role: 'assistant', content },
            {
              role: 'user',
              content: `[Tool Results]\n${toolResultParts}\n\nBased on the above tool results, provide your answer to the user. If you need to call more tools, respond with another tool call JSON.`
            }
          ]

          // Continue the conversation with tool results (recursive but not overlapping)
          this.startCompletion(activeChat, updatedMessages, toolRound + 1)
          return
        }

        // Max tool rounds reached but still returning tool calls
        if (toolCalls.length > 0 && toolRound >= maxToolRounds) {
          content =
            'I reached the maximum number of tool call rounds. Here is what I found so far. Please try a more specific query if needed.'
        }

        const now = Date.now()
        this.chatAbort.delete(activeChat.id)
        this.setState((state) => {
          const tokens = getTokens(content)
          const msg = state.activeChat!.messages![state.activeChat!.messages!.length - 1]
          if (state.activeChat?.id === activeChat.id) {
            state.activeChat!.pending = false
            state.activeChat!.updated = now
            msg.tokens = tokens
            msg.content = content
            localStorage.removeItem(`chunk-${msg.id}`)
            this.store.model.updateMessage(msg.id, {
              content: msg.content,
              tokens: msg.tokens,
              updated: now,
              error: undefined
            })
          } else {
            this.store.model.updateMessage(msg.id, {
              content: content,
              tokens: tokens,
              updated: now,
              error: undefined
            })
          }
        })
        this.refresh()
        if (!activeChat.topic) {
          this.generateTopic(activeChat.id)
        }
        this.updateChat(activeChat.id, {
          updated: now
        })
      },
      signal: controller.signal
    })
  }
  private async generateTopic(id: string) {
    const chat = await this.store.model.getChat(id)
    if (!chat || this.generateTopicChat.has(id) || !!chat?.topic || !chat?.messages?.length) {
      return
    }
    try {
      this.generateTopicChat.add(id)
      const smMessages = this.activeClient!.getSummaryMessage(chat.messages!)
      await this.activeClient!.completionStream(smMessages, {
        onFinish: (content: string) => {
          if (content) {
            this.setState((state) => {
              const c = state.chats.find((item) => item.id === id)
              if (c) {
                c.topic = content!
              }
              if (state.activeChat?.id === id) {
                state.activeChat!.topic = content!
              }
            })
            this.store.model.updateChat(chat.id, {
              topic: content!
            })
            this.refresh()
          }
        }
      })
    } finally {
      this.generateTopicChat.delete(id)
    }
  }

  private async getHistoryMessages(chat: IChat) {
    // let start = chat.summaryIndex && chat.summaryIndex > 0 ? chat.summaryIndex : 0
    // // 未压缩的消息
    // const messages = chat.messages!.slice(start)
    // let summaryText = chat.summary
    // // 大于最小消息数
    // if (messages.length > this.minRetainMessages) {
    //   const tokens = messages.reduce((token, msg) => token + msg.tokens, 0)
    //   // 大于token阈值
    //   if (tokens > this.warningThreshold) {
    //     // 保留最近的消息，找出之前的消息
    //     const compressedMessages = messages.slice(0, -this.recentMessagesCount)
    //     if (compressedMessages.length > 2) {
    //       const summaryMessages = this.activeClient!.getHistoryCompressMessage(
    //         compressedMessages,
    //         chat.summary
    //       )
    //       const [content] = await this.activeClient!.client.completion(summaryMessages)
    //       if (content) {
    //         summaryText = content!
    //         this.setState((state) => {
    //           if (state.activeChat?.id === chat.id) {
    //             state.activeChat!.summaryIndex = start + compressedMessages.length
    //             start = start + compressedMessages.length
    //             state.activeChat!.summary = content
    //           }
    //         })
    //         this.store.model.updateChat(chat.id, {
    //           summaryIndex: start + compressedMessages.length,
    //           summary: content!
    //         })
    //       }
    //     }
    //   }
    // }
    const newMessages = chat
      .messages!.slice(-(this.store.settings.state.maxMessageRounds * 2))
      .reduce((acc, m) => {
        if (m.role === 'assistant' && m.content === '...') {
          return acc
        }
        const data: IMessageModel = {
          role: m.role,
          content: m.content
        }
        if (m.files?.length) {
          data.content = `Given the following file contents as context, Content is sent in markdown format:\n${m.files.map((f) => `File ${f.name}:\n ${f.content}`).join('\n')} \n ${data.content}`
        } else if (m.context?.length) {
          data.content = `Given the following notes snippet as context, Content is sent in markdown format:\n ${m.context.map((c) => `${c.content}`).join('\n')} \n ${data.content}`
        }
        if (m.docs?.length) {
          data.content = `Given the following notes, Content is sent in markdown format:\n ${m.docs.map((d) => `[FileName]: ${d.name}\n ${d.content}`).join('\n\n')} \n ${data.content}`
        }
        if (m.images?.length) {
          data.images = m.images
        }
        acc.push(data)
        return acc
      }, [] as IMessageModel[])
    let prompt = `You are an AI assistant integrated with the Marksmith document management system. You have access to the uDos ecosystem via the **Hivemind Orchestrator** (MCP-based agent swarm). The following tools are available:

1. **vault_read(path)** — Read the contents of a file in the vault. Path is relative to the vault root.
2. **vault_write(path, content)** — Write or overwrite a file in the vault with the given content. Path is relative to the vault root.
3. **vault_search(query, limit?)** — Search the vault for documents matching the query. Returns relevant document snippets. Optional limit (default 10).
4. **vault_list(path)** — List files and directories at a given path in the vault.
5. **vault_summarize(path)** — Summarize the contents of a file in the vault.
6. **vault_batch_tag(tag, pattern)** — Apply a tag to all files matching a glob pattern in the vault.

These vault tools are routed through Hivemind, which also connects to **OpenRouter** (multi-model LLM access) and can coordinate swarm tasks across multiple agents. Hivemind provides API budget control, model routing, and orchestration.

When the user asks you to do something involving their documents, notes, vault, or anything requiring external access, use the tools by outputting ONLY a JSON array of tool calls in this exact format (no extra text, no markdown):
[{ "type": "tool", "tool": "tool_name", "arguments": { "arg1": "value1" } }]

You can call multiple tools at once by including multiple objects in the array. After the tool results are provided, respond to the user naturally. Answer in the language used by the user.`

    newMessages.unshift({
      role: 'system',
      content: prompt
    })
    return newMessages
  }

  async checkLLMApiConnection({
    provider,
    baseUrl,
    apiKey,
    model,
    mode
  }: {
    provider: string
    baseUrl?: string
    apiKey: string
    model: string
    mode: string
  }): Promise<{ success: boolean; message: string; error?: any }> {
    try {
      return await new Promise(async (resolve, reject) => {
        const client = new AiClient({
          mode: provider,
          baseUrl: baseUrl || openAiModels.get(mode),
          apiKey: apiKey,
          model: model,
          id: nid(),
          options: {}
        })
        await client.completionStream([{ role: 'user', content: 'Hello' }], {
          onFinish: (content) => {
            console.log('test finish', content)
            resolve({
              success: true,
              message: `${provider} API连接成功`
            })
          },
          max_tokens: 5,
          onError: (code, message, e) => {
            resolve({
              success: false,
              error: e,
              message: `${code}: ${message}`
            })
          }
        })
      })
    } catch (error: any) {
      return {
        success: false,
        error,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  async deleteChat(id: string) {
    await this.store.model.deleteChat(id)
    this.setState((state) => {
      state.chats = state.chats.filter((item) => item.id !== id)
      if (state.activeChat?.id === id) {
        state.activeChat = null
      }
    })
  }
  setWebSearch(webSearch: boolean) {
    const { activeChat } = this.state
    if (activeChat) {
      this.store.model.updateChat(activeChat.id, {
        websearch: webSearch
      })
    }
    this.setState((state) => {
      if (state.activeChat) {
        state.activeChat!.websearch = webSearch
      }
      state.webSearch = webSearch
    })
  }
}
