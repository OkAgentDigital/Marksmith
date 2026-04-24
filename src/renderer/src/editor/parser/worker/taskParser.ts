import { Content } from 'mdast'
import { Task, TaskStatus, TaskPriority } from '../../../types/task'

/**
 * Obsidian Tasks format parser
 * Supports: - [ ] task 📅 2023-12-25 ✅ 2023-12-20 ⏫ #tag @context
 */

export interface ParsedTask extends Task {
  lineNumber: number
  originalText: string
  sourceFile: string
  sourceWorkspace: string
}

export const parseTasksFromMarkdown = (
  md: string,
  sourceFile: string = 'unknown',
  sourceWorkspace: string = 'unknown'
): ParsedTask[] => {
  const tasks: ParsedTask[] = []
  const lines = md.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const taskMatch = line.match(/^\s*(-|\*|\+)\s+\[([ x\/\-])\]\s+(.*?)$/)
    
    if (taskMatch) {
      const [fullMatch, bullet, statusChar, taskText] = taskMatch
      const task: ParsedTask = {
        id: `${sourceFile}:${i}`,
        lineNumber: i + 1,
        originalText: line.trim(),
        sourceFile,
        sourceWorkspace,
        status: getTaskStatus(statusChar),
        description: taskText.trim(),
        created: null,
        due: null,
        completion: null,
        priority: null,
        recurrence: null,
        tags: [],
        raw: line.trim()
      }
      
      // Parse task metadata from description
      parseTaskMetadata(task)
      tasks.push(task)
    }
  }
  
  return tasks
}

const getTaskStatus = (char: string): TaskStatus => {
  switch (char.toLowerCase()) {
    case ' ':
    case '':
      return 'todo'
    case 'x':
      return 'done'
    case '/':
      return 'in_progress'
    case '-':
      return 'cancelled'
    default:
      return 'todo'
  }
}

const parseTaskMetadata = (task: ParsedTask) => {
  // Extract dates: 📅 YYYY-MM-DD (due), ✅ YYYY-MM-DD (completion), ➕ YYYY-MM-DD (created)
  const dueMatch = task.description.match(/📅\s*(\d{4}-\d{2}-\d{2})/)
  const completionMatch = task.description.match(/✅\s*(\d{4}-\d{2}-\d{2})/)
  const createdMatch = task.description.match(/➕\s*(\d{4}-\d{2}-\d{2})/)
  
  if (dueMatch) {
    task.due = dueMatch[1]
    task.description = task.description.replace(/📅\s*\d{4}-\d{2}-\d{2}/, '').trim()
  }
  
  if (completionMatch) {
    task.completion = completionMatch[1]
    task.description = task.description.replace(/✅\s*\d{4}-\d{2}-\d{2}/, '').trim()
  }
  
  if (createdMatch) {
    task.created = createdMatch[1]
    task.description = task.description.replace(/➕\s*\d{4}-\d{2}-\d{2}/, '').trim()
  }
  
  // Extract priority: ⏫ (high), 🔼 (medium), 🔽 (low)
  const priorityMatch = task.description.match(/(⏫|🔼|🔽)/)
  if (priorityMatch) {
    switch (priorityMatch[1]) {
      case '⏫':
        task.priority = 'high'
        break
      case '🔼':
        task.priority = 'medium'
        break
      case '🔽':
        task.priority = 'low'
        break
    }
    task.description = task.description.replace(/(⏫|🔼|🔽)/, '').trim()
  }
  
  // Extract tags: #tag
  const tagMatches = task.description.match(/#(\w[\w\-]*)/g)
  if (tagMatches) {
    task.tags = tagMatches.map(tag => tag.substring(1))
    task.description = task.description.replace(/#\w[\w\-]*/g, '').trim()
  }
  
  // Extract recurrence: 🔁 every day/week/month/year
  const recurrenceMatch = task.description.match(/🔁\s+(every\s+\w+)/i)
  if (recurrenceMatch) {
    task.recurrence = recurrenceMatch[1]
    task.description = task.description.replace(/🔁\s+every\s+\w+/i, '').trim()
  }
  
  // Clean up multiple spaces
  task.description = task.description.replace(/\s+/g, ' ').trim()
}

/**
 * Extract tasks from parsed AST nodes
 */
export const extractTasksFromAST = (nodes: Content[]): ParsedTask[] => {
  const tasks: ParsedTask[] = []
  
  const traverse = (nodes: Content[], parentLine: number = 0) => {
    nodes.forEach(node => {
      // Check for list items with task status
      if (node.type === 'listItem' && typeof node.checked === 'boolean') {
        const status: TaskStatus = node.checked ? 'done' : 'todo'
        
        // Extract task description from children
        let description = ''
        if ('children' in node && node.children && node.children.length > 0) {
          const firstChild = node.children[0]
          if ('children' in firstChild && firstChild.type === 'paragraph' && firstChild.children) {
            description = firstChild.children
              .map(c => 'value' in c ? c.value : '')
              .join(' ')
          }
        }
        
        const task: ParsedTask = {
          id: `ast:${parentLine}`,
          lineNumber: parentLine,
          originalText: description,
          sourceFile: 'ast',
          sourceWorkspace: 'ast',
          status,
          description,
          created: null,
          due: null,
          completion: null,
          priority: null,
          recurrence: null,
          tags: [],
          raw: description
        }
        
        // Parse metadata from description
        parseTaskMetadata(task)
        tasks.push(task)
      }
      
      // Recursively traverse children (type-safe check)
      if ('children' in node && node.children && node.children.length > 0) {
        traverse(node.children as Content[], parentLine + 1)
      }
    })
  }
  
  traverse(nodes)
  return tasks
}

/**
 * Task query system (Obsidian Tasks compatible)
 */
export interface TaskQuery {
  status?: TaskStatus | TaskStatus[]
  due?: 'today' | 'overdue' | 'upcoming' | string
  priority?: TaskPriority | TaskPriority[]
  tags?: string | string[]
  limit?: number
  sortBy?: 'due' | 'priority' | 'status' | 'created'
  groupBy?: 'priority' | 'status' | 'due'
}

export const queryTasks = (tasks: ParsedTask[], query: TaskQuery): ParsedTask[] => {
  let result = [...tasks]
  
  // Filter by status
  if (query.status) {
    const statuses = Array.isArray(query.status) ? query.status : [query.status]
    result = result.filter(task => statuses.includes(task.status))
  }
  
  // Filter by due date
  if (query.due) {
    const today = new Date().toISOString().split('T')[0]
    
    switch (query.due) {
      case 'today':
        result = result.filter(task => task.due === today)
        break
      case 'overdue':
        result = result.filter(task => task.due && task.due < today)
        break
      case 'upcoming':
        result = result.filter(task => task.due && task.due >= today)
        break
      default:
        // Specific date
        result = result.filter(task => task.due === query.due)
        break
    }
  }
  
  // Filter by priority
  if (query.priority) {
    const priorities = Array.isArray(query.priority) ? query.priority : [query.priority]
    result = result.filter(task => task.priority && priorities.includes(task.priority))
  }
  
  // Filter by tags
  if (query.tags) {
    const tagList = Array.isArray(query.tags) ? query.tags : [query.tags]
    result = result.filter(task => 
      task.tags && task.tags.some(tag => tagList.includes(tag))
    )
  }
  
  // Apply limit
  if (query.limit) {
    result = result.slice(0, query.limit)
  }
  
  // Sort results
  if (query.sortBy) {
    switch (query.sortBy) {
      case 'due':
        result.sort((a, b) => 
          (a.due || '9999-99-99').localeCompare(b.due || '9999-99-99')
        )
        break
      case 'priority':
        const priorityOrder = { high: 1, medium: 2, low: 3 }
        result.sort((a, b) => 
          (priorityOrder[a.priority || 'low'] || 4) - (priorityOrder[b.priority || 'low'] || 4)
        )
        break
      case 'status':
        const statusOrder = { todo: 1, in_progress: 2, done: 3, cancelled: 4 }
        result.sort((a, b) => 
          statusOrder[a.status] - statusOrder[b.status]
        )
        break
      case 'created':
        result.sort((a, b) => 
          (a.created || '0000-00-00').localeCompare(b.created || '0000-00-00')
        )
        break
    }
  }
  
  return result
}

/**
 * Task status icons for display
 */
export const getTaskStatusIcon = (status: TaskStatus): string => {
  switch (status) {
    case 'todo': return '□'
    case 'done': return '☑'
    case 'in_progress': return '▶'
    case 'cancelled': return '⊘'
    default: return '□'
  }
}

/**
 * Task priority icons for display
 */
export const getTaskPriorityIcon = (priority: TaskPriority | null): string => {
  switch (priority) {
    case 'high': return '⏫'
    case 'medium': return '🔼'
    case 'low': return '🔽'
    default: return ''
  }
}