/**
 * Task types for Obsidian Tasks compatibility
 */

export type TaskStatus = 'todo' | 'done' | 'in_progress' | 'cancelled'
export type TaskPriority = 'high' | 'medium' | 'low'

export interface Task {
  id: string
  status: TaskStatus
  description: string
  created: string | null
  due: string | null
  completion: string | null
  priority: TaskPriority | null
  recurrence: string | null
  tags: string[]
  raw: string
}

export interface TaskWithContext extends Task {
  sourceFile: string
  sourceWorkspace: string
  lineNumber: number
  originalText: string
}

export interface TaskQueryResult {
  tasks: TaskWithContext[]
  total: number
  groups: Record<string, TaskWithContext[]>
}

export interface TaskViewState {
  filter: 'all' | 'today' | 'overdue' | 'upcoming' | 'done' | 'cancelled'
  sortBy: 'due' | 'priority' | 'status' | 'created'
  groupBy: 'priority' | 'status' | 'due' | 'none'
  searchQuery: string
  selectedTask: TaskWithContext | null
}

export interface TaskStats {
  total: number
  todo: number
  done: number
  overdue: number
  byPriority: Record<TaskPriority, number>
  byStatus: Record<TaskStatus, number>
}