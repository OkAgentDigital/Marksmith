import { TabStore } from '@/store/note/tab'
import { TabContext } from '@/store/note/TabCtx'
import { useStore } from '@/store/store'
import { isMod } from '@/utils/common'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useRef } from 'react'
import { MEditor } from './Editor'
import { FloatBar } from './tools/FloatBar'
import { InsertAutocomplete } from './tools/InsertAutocomplete'
import { InsertLink } from './tools/InsertLink'
import { LangAutocomplete } from './tools/LangAutocomplete'
import { Heading } from './tools/Leading'
import { ChooseWikiLink } from './tools/Links'
import { Search } from './tools/Search'
import { Empty } from './ui/Empty'
export const EditorFrame = observer(({ tab }: { tab: TabStore }) => {
  const timer = useRef(0)
  const store = useStore()
  const click = useCallback((e: React.MouseEvent) => {
    if (isMod(e) && e.target) {
      const el = (e.target as HTMLDivElement).parentElement
      if (!el) return
      if (el.dataset.fnc) {
        const target = document.querySelector(`[data-fnd-name="${el.dataset.fncName}"]`)
        target?.scrollIntoView({ behavior: 'smooth' })
      }
      if (el.dataset.fnd) {
        const target = document.querySelector(`[data-fnc-name="${el.dataset.fndName}"]`)
        target?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [])

  return (
    <TabContext value={tab}>
      <div
        className={`flex-1 h-full overflow-y-auto items-start relative ${tab.state.startDragging ? 'dragging' : ''}`}
        onScroll={(e) => {
          clearTimeout(timer.current)
        }}
        ref={(dom) => {
          tab.container = dom as HTMLDivElement
        }}
      >
        <Search />
        {!!tab.state.doc && (
          <>
            <div className={`items-start min-h-[calc(100vh_-_40px)] relative`} onClick={click}>
              <div
                style={{ transitionProperty: 'padding' }}
                className={`flex-1 duration-200 flex justify-center items-start h-full`}
              >
                <div style={{ maxWidth: 796 }} className={`flex-1 content px-12`}>
                  <MEditor tab={tab} />
                </div>
                {!store.settings.state.showAgent && <Heading tab={tab} />}
              </div>
              <ChooseWikiLink />
            </div>
          </>
        )}
        {!tab.state.doc && <Empty />}
        <FloatBar />
        <InsertLink />
        <LangAutocomplete tab={tab} />
        <InsertAutocomplete />
      </div>
    </TabContext>
  )
})
