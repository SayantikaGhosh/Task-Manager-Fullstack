import { useEffect, useState } from "react"
import { authenticatedFetch } from "../api"
import TaskItem from "./TaskItem"

type DashboardProps = {
  onLogout: () => void
}

type Task = {
  id: string
  title: string
  description: string | null
  status: string
  due_date: string | null
}

type Stats = {
  total: number
  todo: number
  in_progress: number
  done: number
}

function Dashboard({ onLogout }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("TODO")
  const [dueDate, setDueDate] = useState("")

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editStatus, setEditStatus] = useState("TODO")
  const [editDueDate, setEditDueDate] = useState("")

  const [statusFilter, setStatusFilter] = useState("")

  const [stats, setStats] = useState<Stats | null>(null)

  async function getStats() {
    const response = await authenticatedFetch(
      "http://127.0.0.1:8000/tasks/stats"
    )

    if (!response.ok) {
      return
    }

    const data = await response.json()

    setStats(data)
  }

  async function createTask() {
    const response = await authenticatedFetch(
      "http://127.0.0.1:8000/tasks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          description: description,
          status: status,
          due_date: dueDate || null,
        }),
      }
    )

    if (!response.ok) {
      return
    }

    const newTask = await response.json()

    setTasks([newTask, ...tasks])

    setTitle("")
    setDescription("")
    setStatus("TODO")
    setDueDate("")

    await getStats()
  }

  async function deleteTask(taskId: string) {
    const response = await authenticatedFetch(
      `http://127.0.0.1:8000/tasks/${taskId}`,
      {
        method: "DELETE",
      }
    )

    if (!response.ok) {
      return
    }

    setTasks(
      tasks.filter((task) => task.id !== taskId)
    )

    await getStats()
  }

  async function updateTask(taskId: string) {
    const response = await authenticatedFetch(
      `http://127.0.0.1:8000/tasks/${taskId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          status: editStatus,
          due_date: editDueDate || null,
        }),
      }
    )

    if (!response.ok) {
      return
    }

    const updatedTask = await response.json()

    setTasks(
      tasks.map((task) =>
        task.id === taskId ? updatedTask : task
      )
    )

    setEditingTaskId(null)

    await getStats()
  }

  useEffect(() => {
    async function getTasks() {
      let url = "http://127.0.0.1:8000/tasks"

      if (statusFilter !== "") {
        url = `http://127.0.0.1:8000/tasks?status=${statusFilter}`
      }

      const response = await authenticatedFetch(url)

      if (!response.ok) {
        return
      }

      const data = await response.json()

      setTasks(data)
    }

    getTasks()
    getStats()
  }, [statusFilter])

  return (
    <div>
      <button
        className="logout-button"
        onClick={onLogout}
      >
        Logout
      </button>

      <h2>Dashboard</h2>

      <h3>Task Statistics</h3>

      {stats && (
        <div className="stats">
          <p>Total: {stats.total}</p>
          <p>Todo: {stats.todo}</p>
          <p>In Progress: {stats.in_progress}</p>
          <p>Done: {stats.done}</p>
        </div>
      )}

      <h3>Create Task</h3>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(event) =>
          setDescription(event.target.value)
        }
      />

      <select
        value={status}
        onChange={(event) =>
          setStatus(event.target.value)
        }
      >
        <option value="TODO">Todo</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>

      <input
        type="date"
        value={dueDate}
        onChange={(event) =>
          setDueDate(event.target.value)
        }
      />

      <button onClick={createTask}>
        Create Task
      </button>

      <h3>Filter</h3>

      <select
        value={statusFilter}
        onChange={(event) =>
          setStatusFilter(event.target.value)
        }
      >
        <option value="">All</option>
        <option value="TODO">Todo</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>

      <h3>My Tasks</h3>

      {tasks.map((task) => (
        <div key={task.id}>
          <TaskItem
            task={task}
            onEdit={() => {
              setEditingTaskId(task.id)
              setEditTitle(task.title)
              setEditDescription(task.description ?? "")
              setEditStatus(task.status)
              setEditDueDate(task.due_date ?? "")
            }}
            onDelete={() => deleteTask(task.id)}
          />

          {editingTaskId === task.id && (
            <div>
              <input
                value={editTitle}
                onChange={(event) =>
                  setEditTitle(event.target.value)
                }
              />

              <input
                value={editDescription}
                onChange={(event) =>
                  setEditDescription(event.target.value)
                }
              />

              <select
                value={editStatus}
                onChange={(event) =>
                  setEditStatus(event.target.value)
                }
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">
                  In Progress
                </option>
                <option value="DONE">Done</option>
              </select>

              <input
                type="date"
                value={editDueDate}
                onChange={(event) =>
                  setEditDueDate(event.target.value)
                }
              />

              <button
                onClick={() => updateTask(task.id)}
              >
                Save
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default Dashboard