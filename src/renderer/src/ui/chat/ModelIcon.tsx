import { OpenRouter } from '@lobehub/icons'
import { memo } from 'react'

export const ModelIcon = memo(({ mode, size }: { mode: string; size: number }) => {
  if (mode === 'openrouter') {
    return <OpenRouter.Avatar size={size} />
  }
  return null
})
