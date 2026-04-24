import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { useStore } from '../../store/store'
import { TaskWithContext } from '../../types/task'
import { getTaskStatusIcon, getTaskPriorityIcon } from '../../editor/parser/worker/taskParser'
import { Input, Select, Button, Empty, Spin, Tag, Tooltip, Progress, Checkbox } from 'antd'
import { CalendarOutlined, SearchOutlined, FilterOutlined, 
         SortAscendingOutlined, SortDescendingOutlined, ReloadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

export const TaskView = observer(() => {
  const { t } = useTranslation()
  const store = useStore()
  const [filteredTasks, setFilteredTasks] = useState<TaskWithContext[]>([])
  const [stats, setStats] = useState<any>(null)
  
  useEffect(() => {
    // Load tasks when component mounts or workspace changes
    if (store.note.state.currentSpace) {
      store.task.loadTasksFromWorkspace()
    }
  }, [store.note.state.currentSpace?.id])
  
  useEffect(() => {
    // Update filtered tasks when tasks or view state changes
    const result = store.task.applyViewState()
    setFilteredTasks(result.tasks)
    setStats(store.task.getStats())
  }, [store.task.tasks, store.task.viewState])
  
  const handleFilterChange = (filter: string) => {
    store.task.setViewState({ filter: filter as any })
  }
  
  const handleSortChange = (sortBy: string) => {
    store.task.setViewState({ sortBy: sortBy as any })
  }
  
  const handleSearch = (query: string) => {
    store.task.setViewState({ searchQuery: query })
  }
  
  const toggleTask = async (task: TaskWithContext) => {
    await store.task.toggleTaskCompletion(task)
  }
  
  const navigateToTask = (task: TaskWithContext) => {
    store.task.navigateToTask(task)
  }
  
  const refreshTasks = () => {
    store.task.refreshTasks()
  }
  
  if (store.task.isLoading && store.task.tasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin size="large" tip="Loading tasks..." />
      </div>
    )
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b dark:border-gray-700 border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('tasks.title')}</h2>
          <div className="flex items-center space-x-2">
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshTasks}
              size="small"
              title={t('tasks.refresh')}
            />
          </div>
        </div>
        
        {/* Stats */}
        {stats && (
          <div className="mt-3 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Total:</span>
              <span className="font-medium">{stats.total}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Todo:</span>
              <span className="font-medium text-blue-500">{stats.todo}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Done:</span>
              <span className="font-medium text-green-500">{stats.done}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Overdue:</span>
              <span className="font-medium text-red-500">{stats.overdue}</span>
            </div>
          </div>
        )}
        
        {/* Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {/* Filter */}
          <Select
            value={store.task.viewState.filter}
            onChange={handleFilterChange}
            size="small"
            style={{ width: 120 }}
          >
            <Select.Option value="all">{t('tasks.all')}</Select.Option>
            <Select.Option value="today">{t('tasks.today')}</Select.Option>
            <Select.Option value="overdue">{t('tasks.overdue')}</Select.Option>
            <Select.Option value="upcoming">{t('tasks.upcoming')}</Select.Option>
            <Select.Option value="done">{t('tasks.done')}</Select.Option>
            <Select.Option value="cancelled">{t('tasks.cancelled')}</Select.Option>
          </Select>
          
          {/* Sort */}
          <Select
            value={store.task.viewState.sortBy}
            onChange={handleSortChange}
            size="small"
            style={{ width: 120 }}
          >
            <Select.Option value="due">{t('tasks.dueDate')}</Select.Option>
            <Select.Option value="priority">{t('tasks.priority')}</Select.Option>
            <Select.Option value="status">{t('tasks.status')}</Select.Option>
            <Select.Option value="created">{t('tasks.created')}</Select.Option>
          </Select>
          
          {/* Search */}
          <Input
            placeholder={t('tasks.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={store.task.viewState.searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            size="small"
            style={{ width: 200 }}
          />
        </div>
      </div>
      
      {/* Task List */}
      <div className="flex-1 overflow-auto p-4">
        {store.task.error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{store.task.error}</p>
            <Button onClick={refreshTasks} className="mt-4">Retry</Button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <Empty
            description={
              store.task.viewState.searchQuery 
                ? t('tasks.noMatch') 
                : t('tasks.noTasks')
            }
          />
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="border dark:border-gray-700 border-gray-200 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => navigateToTask(task)}
              >
                <div className="flex items-start">
                  {/* Checkbox */}
                  <div className="mr-3 mt-0.5">
                    <Checkbox
                      checked={task.status === 'done'}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleTask(task)
                      }}
                    />
                  </div>
                  
                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {/* Priority */}
                      {task.priority && (
                        <Tooltip title={`Priority: ${task.priority}`}>
                          <span className="text-lg">
                            {getTaskPriorityIcon(task.priority)}
                          </span>
                        </Tooltip>
                      )}
                      
                      {/* Due Date */}
                      {task.due && (
                        <Tooltip title={`Due: ${task.due}`}>
                          <Tag color="blue" className="mx-0">
                            <CalendarOutlined className="mr-1" />
                            {task.due}
                          </Tag>
                        </Tooltip>
                      )}
                      
                      {/* Overdue indicator */}
                      {task.due && isOverdue(task.due) && (
                        <Tag color="red">Overdue</Tag>
                      )}
                    </div>
                    
                    {/* Description */}
                    <div className="mt-1 text-sm">
                      <span className="font-medium">{task.description}</span>
                    </div>
                    
                    {/* Metadata */}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      {/* Tags */}
                      {task.tags.map(tag => (
                        <Tag key={tag} className="m-0">#{tag}</Tag>
                      ))}
                      
                      {/* Source */}
                      <span title={`Line ${task.lineNumber}`}>
                        {task.sourceFile}:{task.lineNumber}
                      </span>
                      
                      {/* Recurrence */}
                      {task.recurrence && (
                        <span>🔁 {task.recurrence}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

const isOverdue = (dueDate: string): boolean => {
  const today = new Date().toISOString().split('T')[0]
  return dueDate < today
}