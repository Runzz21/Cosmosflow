import { useStore } from '../store/useStore'
import { format } from 'date-fns'

interface Props {
  project: any
  onClick: () => void
}

export default function ProjectCard({ project, onClick }: Props) {
  const { tasks } = useStore()
  const projectTasks = tasks.filter(t => t.project_id === project.id)
  const done = projectTasks.filter(t => t.kanban_status === 'done').length
  const progress = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0

  return (
    <div onClick={onClick} className="card-float p-6 cursor-pointer">
      <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{project.description || 'No description'}</p>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {project.deadline && (
        <p className="text-xs text-gray-500">
          Deadline: {format(new Date(project.deadline), 'dd MMM yyyy')}
        </p>
      )}
    </div>
  )
}