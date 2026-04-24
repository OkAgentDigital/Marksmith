import { ReactEditor as BaseReactEditor, Editor as BaseEditor, Transforms, Node, Path, Range } from 'slate-react'
import { Editor as SlateEditor } from 'slate'

// Extend the ReactEditorInterface to add the missing methods
declare module 'slate-react' {
  interface ReactEditorInterface extends BaseReactEditor {
    focus: () => void
    blur: () => void
    isFocused: () => boolean
    isReadOnly: () => boolean
    findPath: (node: Node) => Path | null
    toDOMNode: (node: Node) => HTMLElement
    toSlateNode: (domNode: HTMLElement) => Node
  }
}

// Extend the Slate Editor interface as well
declare module 'slate' {
  interface EditorInterface extends SlateEditor {
    focus: () => void
    blur: () => void
    isFocused: () => boolean
    isReadOnly: () => boolean
    findPath: (node: Node) => Path | null
    toDOMNode: (node: Node) => HTMLElement
    toSlateNode: (domNode: HTMLElement) => Node
  }
}

// Create extended types that include the additional methods
type ExtendedReactEditor = BaseReactEditor & {
  focus: () => void
  blur: () => void
  isFocused: () => boolean
  isReadOnly: () => boolean
  findPath: (node: Node) => Path | null
  toDOMNode: (node: Node) => HTMLElement
  toSlateNode: (domNode: HTMLElement) => Node
}

type ExtendedEditor = BaseEditor & {
  focus: () => void
  blur: () => void
  isFocused: () => boolean
  isReadOnly: () => boolean
  findPath: (node: Node) => Path | null
  toDOMNode: (node: Node) => HTMLElement
  toSlateNode: (domNode: HTMLElement) => Node
}

// Export the extended types
export { ExtendedReactEditor as ReactEditor, ExtendedEditor as Editor, Transforms, Node, Path, Range }