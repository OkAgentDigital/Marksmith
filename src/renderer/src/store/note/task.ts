import { makeAutoObservable } from 'mobx'
import { TaskWithContext, TaskQueryResult, TaskViewState, TaskStats } from '../../types/task'
import { parseTasksFromMarkdown, queryTasks } from '../../editor/parser/worker/taskParser'
import { Store } from '../store'

export class TaskStore {
  tasks: TaskWithContext[] = []
  viewState: TaskViewState = {
    filter: 'all',
    sortBy: 'due',
    groupBy: 'none',
    searchQuery: '',
    selectedTask: null
  }
  isLoading = false
  error: string | null = null
  
  constructor(private store: Store) {
    makeAutoObservable(this)
  }
  
  /**
   * Load tasks from all documents in current workspace
   */
  async loadTasksFromWorkspace(): Promise<void> {
    this.isLoading = true
    this.error = null
    
    try {
      const docs = await this.store.model.getDocs(this.store.note.state.currentSpace?.id || '')
      const tasks: TaskWithContext[] = []
      
      for (const doc of docs) {
        if (!doc.folder) { // Only parse markdown files, not folders
          try {
            // Get the current workspace name
            const workspaceName = this.store.note.state.currentSpace?.name || '@toybox'
            
            // Read document content using the vault system
            const content = await this.store.model.readDocumentContent(doc.id, workspaceName)
            const parsedTasks = parseTasksFromMarkdown(
              content,
              doc.name,
              workspaceName
            )
            tasks.push(...parsedTasks)
          } catch (error) {
            console.error(`Error parsing tasks from ${doc.name}:`, error)
          }
        }
      }
      
      this.tasks = tasks
      this.applyViewState()
    } catch (error) {
      console.error('Failed to load tasks:', error)
      this.error = 'Failed to load tasks'
    } finally {
      this.isLoading = false
    }
  }
  
  /**
   * Apply current view state to filter and sort tasks
   */
  applyViewState(): TaskQueryResult {
    const query: any = {}
    
    // Map filter to query status
    if (this.viewState.filter !== 'all') {
      switch (this.viewState.filter) {
        case 'today':
          query.due = 'today'
          break
        case 'overdue':
          query.due = 'overdue'
          break
        case 'upcoming':
          query.due = 'upcoming'
          break
        case 'done':
          query.status = 'done'
          break
        case 'cancelled':
          query.status = 'cancelled'
          break
      }
    }
    
    // Add search query filtering
    if (this.viewState.searchQuery) {
      const searchLower = this.viewState.searchQuery.toLowerCase()
      query.search = searchLower
    }
    
    // Apply sorting
    query.sortBy = this.viewState.sortBy
    
    // Filter and sort tasks
    let filteredTasks = [...this.tasks]
    
    // Apply search filter
    if (query.search) {
      filteredTasks = filteredTasks.filter(task => 
        task.description.toLowerCase().includes(query.search) ||
        task.tags.some(tag => tag.toLowerCase().includes(query.search))
      )
    }
    
    // Apply status/due filters
    if (query.status) {
      filteredTasks = filteredTasks.filter(task => task.status === query.status)
    }
    
    if (query.due) {
      const today = new Date().toISOString().split('T')[0]
      switch (query.due) {
        case 'today':
          filteredTasks = filteredTasks.filter(task => task.due === today)
          break
        case 'overdue':
          filteredTasks = filteredTasks.filter(task => task.due && task.due < today)
          break
        case 'upcoming':
          filteredTasks = filteredTasks.filter(task => task.due && task.due >= today)
          break
      }
    }
    
    // Sort tasks
    if (query.sortBy) {
      switch (query.sortBy) {
        case 'due':
          filteredTasks.sort((a, b) => 
            (a.due || '9999-99-99').localeCompare(b.due || '9999-99-99')
          )
          break
        case 'priority':
          const priorityOrder = { high: 1, medium: 2, low: 3 }
          filteredTasks.sort((a, b) => 
            (priorityOrder[a.priority || 'low'] || 4) - (priorityOrder[b.priority || 'low'] || 4)
          )
          break
        case 'status':
          const statusOrder = { todo: 1, in_progress: 2, done: 3, cancelled: 4 }
          filteredTasks.sort((a, b) => 
            statusOrder[a.status] - statusOrder[b.status]
          )
          break
        case 'created':
          filteredTasks.sort((a, b) => 
            (a.created || '0000-00-00').localeCompare(b.created || '0000-00-00')
          )
          break
      }
    }
    
    // Group tasks if needed
    const groups: Record<string, TaskWithContext[]> = {}
    if (this.viewState.groupBy !== 'none') {
      filteredTasks.forEach(task => {
        const groupKey = task[this.viewState.groupBy] || 'none'
        if (!groups[groupKey]) {
          groups[groupKey] = []
        }
        groups[groupKey].push(task)
      })
    }
    
    return {
      tasks: filteredTasks,
      total: filteredTasks.length,
      groups
    }
  }
  
  /**
   * Get task statistics
   */
  getStats(): TaskStats {
    const todo = this.tasks.filter(t => t.status === 'todo').length
    const done = this.tasks.filter(t => t.status === 'done').length
    const overdue = this.tasks.filter(t => t.due && t.due < new Date().toISOString().split('T')[0]).length
    
    return {
      total: this.tasks.length,
      todo,
      done,
      overdue,
      byPriority: {
        high: this.tasks.filter(t => t.priority === 'high').length,
        medium: this.tasks.filter(t => t.priority === 'medium').length,
        low: this.tasks.filter(t => t.priority === 'low').length
      },
      byStatus: {
        todo,
        done,
        in_progress: this.tasks.filter(t => t.status === 'in_progress').length,
        cancelled: this.tasks.filter(t => t.status === 'cancelled').length
      }
    }
  }
  
  /**
   * Update view state and return filtered tasks
   */
  setViewState(updates: Partial<TaskViewState>): TaskQueryResult {
    this.viewState = { ...this.viewState, ...updates }
    return this.applyViewState()
  }
  
  /**
   * Toggle task completion status
   */
  async toggleTaskCompletion(task: TaskWithContext): Promise<void> {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    
    // Update task in store
    this.tasks = this.tasks.map(t => 
      t.id === task.id ? { ...t, status: newStatus } : t
    )
    
    // TODO: Update the actual document content
    console.log(`Task ${task.id} toggled to ${newStatus}`)
  }
  
  /**
   * Navigate to task source
   */
  navigateToTask(task: TaskWithContext): void {
    // Find the document containing this task
    const docName = task.sourceFile
    
    // TODO: Implement actual navigation
    console.log(`Navigate to ${docName} line ${task.lineNumber}`)
  }
  
  /**
   * Refresh tasks from current workspace
   */
  refreshTasks(): Promise<void> {
    return this.loadTasksFromWorkspace()
  }
}