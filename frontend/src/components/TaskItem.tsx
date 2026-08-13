type Task = {
  id: string
  title: string
  description: string | null
  status: string
  due_date: string | null
}

type TaskItemProps = {
  task: Task
  onEdit: () => void
  onDelete: () => void
}

function TaskItem({
  task,
  onEdit,
  onDelete,
}: TaskItemProps) {
  return (
  <div className="task-card">
    <h4>{task.title}</h4>

    <p>{task.description}</p>

    <p>Status: {task.status}</p>

    <p>
      Due date: {task.due_date ?? "No due date"}
    </p>

    <div className="task-actions">
      <button onClick={onEdit}>
        Edit
      </button>

      <button onClick={onDelete}>
        Delete
      </button>
    </div>
  </div>
)
}

export default TaskItem