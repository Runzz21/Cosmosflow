// src/pages/ProjectOverview.tsx
import { useState, useEffect } from "react"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd"
import { supabase } from "../lib/supabase"
import toast from "react-hot-toast"
import {
  Plus,
  Calendar,
  User,
  GripVertical,
  Trash2,
  X,
  Edit2,
  ChevronDown,
  AlertCircle,
  Clock,
  CheckCircle,
  FolderOpen,
} from "lucide-react"

interface Project {
  id: string
  name: string
}

interface Task {
  id: string
  title: string
  description?: string | null
  assignee?: string | null
  deadline?: string | null
  kanban_status: string // ← Supabase ngirim string, jadi kita terima string dulu
  project_id: string
  projects?: { name: string } | null
}

export default function ProjectOverview() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)

  const userRole = sessionStorage.getItem("user_role")

  const canEdit = userRole !== "member" && userRole !== "viewer"

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignee: "",
    deadline: "",
    project_id: "",
    kanban_status: "todo" as "todo" | "inprogress" | "done",
    dropdownOpen: false,
    projectDropdownOpen: false,
  })

  // Fetch tasks + projects
  useEffect(() => {
    const fetchData = async () => {
      const { data: taskData } = await supabase
        .from("tasks")
        .select("*, projects(name)")
        .order("created_at", { ascending: false })

      const { data: projectData } = await supabase
        .from("projects")
        .select("id, name")
        .order("name")

      if (taskData) setTasks(taskData)
      if (projectData) setProjects(projectData)
    }

    fetchData()

    const channel = supabase
      .channel("kanban_all")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, fetchData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !canEdit) return

    const newStatus = result.destination.droppableId as "todo" | "inprogress" | "done"

    const { error } = await supabase
      .from("tasks")
      .update({ kanban_status: newStatus })
      .eq("id", result.draggableId)

    if (error) toast.error("Gagal pindah kolom")
    else toast.success("Status diperbarui!")
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error("Judul wajib diisi!")
    if (!form.project_id) return toast.error("Pilih project dulu!")

    setLoading(true)

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      assignee: form.assignee.trim() || null,
      deadline: form.deadline || null,
      project_id: form.project_id,
      kanban_status: form.kanban_status,
    }

    if (editTask) {
      const { error } = await supabase.from("tasks").update(payload).eq("id", editTask.id)
      if (!error) toast.success("Tugas diperbarui!")
    } else {
      const { error } = await supabase.from("tasks").insert(payload)
      if (!error) toast.success("Tugas berhasil ditambahkan!")
    }

    setLoading(false)
    closeModal()
  }

  const hapusTugas = async (id: string, title: string) => {
    if (!confirm(`Hapus tugas "${title}"?`)) return
    const { error } = await supabase.from("tasks").delete().eq("id", id)
    if (!error) toast.success("Tugas dihapus!")
  }

  const openEdit = (task: Task) => {
    setEditTask(task)
    setForm({
      title: task.title,
      description: task.description || "",
      assignee: task.assignee || "",
      deadline: task.deadline || "",
      project_id: task.project_id,
      kanban_status:
        task.kanban_status === "todo" || task.kanban_status === "inprogress" || task.kanban_status === "done"
          ? task.kanban_status as "todo" | "inprogress" | "done"
          : "todo",
      dropdownOpen: false,
      projectDropdownOpen: false,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditTask(null)
    setForm({
      title: "",
      description: "",
      assignee: "",
      deadline: "",
      project_id: "",
      kanban_status: "todo",
      dropdownOpen: false,
      projectDropdownOpen: false,
    })
  }

  const getProjectColor = (name: string) => {
    const colors = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500",
    ]
    return colors[Math.abs(name.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length]
  }

  const columns = [
    { id: "todo", title: "To Do", icon: AlertCircle, color: "text-yellow-500" },
    { id: "inprogress", title: "In Progress", icon: Clock, color: "text-blue-500" },
    { id: "done", title: "Done", icon: CheckCircle, color: "text-green-500" },
  ]

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Project Overview
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
            {tasks.length} tugas • {projects.length} project
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xl px-8 py-4 rounded-2xl shadow-xl flex items-center gap-3 transition hover:scale-105"
          >
            <Plus className="w-6 h-6" /> Tambah Tugas
          </button>
        )}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {columns.map((col) => {
            const columnTasks = tasks.filter((t) => t.kanban_status === col.id)

            return (
              <div key={col.id} className="flex flex-col">
                <div className="mb-6 px-6 py-4 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-3">
                  <col.icon className={`w-6 h-6 ${col.color}`} />
                  <h3 className="font-bold text-lg text-white">{col.title}</h3>
                  <span className="ml-auto bg-white/20 dark:bg-black/40 px-3 py-1 rounded-full text-sm">
                    {columnTasks.length}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-96 rounded-3xl p-6 space-y-5 border-2 border-dashed transition-all ${
                        snapshot.isDraggingOver
                          ? "bg-purple-500/20 dark:bg-purple-500/30 border-purple-500"
                          : "bg-white/5 dark:bg-white/5 border-transparent"
                      }`}
                    >
                      {columnTasks.map((task, index) => {
                        const projectName = task.projects?.name || "Tanpa Project"
                        const gradient = getProjectColor(projectName)

                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`rounded-2xl p-6 shadow-xl backdrop-blur-xl border transition-all group relative overflow-hidden ${
                                  snapshot.isDragging ? "rotate-3 scale-105 shadow-2xl" : ""
                                } bg-white dark:bg-gray-800 border-gray-200 dark:border-white/20 hover:shadow-2xl`}
                              >
                                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />
                                <div className="flex items-center gap-2 mb-3 pt-2">
                                  <FolderOpen className="w-4 h-4 text-purple-500" />
                                  <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                    {projectName}
                                  </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 pr-24">
                                  {task.title}
                                </h3>

                                <div className="flex items-center gap-2 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                                  {canEdit && (
                                    <>
                                      <button onClick={() => openEdit(task)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => hapusTugas(task.id, task.title)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg">
                                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                      </button>
                                    </>
                                  )}
                                  {canEdit && (
                                    <div {...provided.dragHandleProps} className="cursor-grab">
                                      <GripVertical className="w-5 h-5 text-gray-500" />
                                    </div>
                                  )}
                                </div>

                                {task.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{task.description}</p>
                                )}

                                <div className="flex flex-wrap gap-2 text-sm">
                                  {task.assignee && (
                                    <span className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/40 px-3 py-1 rounded-full">
                                      <User className="w-4 h-4" /> {task.assignee}
                                    </span>
                                  )}
                                  {task.deadline && (
                                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                                      new Date(task.deadline) < new Date()
                                        ? "bg-red-100 dark:bg-red-900/40 text-red-600"
                                        : "bg-blue-100 dark:bg-blue-900/40"
                                    }`}>
                                      <Calendar className="w-4 h-4" /> {new Date(task.deadline).toLocaleDateString("id-ID")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {/* MODAL TAMBAH / EDIT */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl p-10 w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-white/20 max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {editTask ? "Edit Tugas" : "Tambah Tugas Baru"}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <input
                type="text"
                placeholder="Judul Tugas *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-6 py-5 rounded-2xl bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-lg font-medium outline-none focus:border-purple-500"
              />

              {/* PILIH PROJECT */}
              <div className="relative">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Project <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, projectDropdownOpen: !form.projectDropdownOpen })}
                  className="w-full px-6 py-5 rounded-2xl bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-left flex justify-between items-center font-medium outline-none focus:border-purple-500"
                >
                  <span className={form.project_id ? "" : "text-gray-500"}>
                    {projects.find((p) => p.id === form.project_id)?.name || "Pilih project..."}
                  </span>
                  <ChevronDown className={`w-5 h-5 transition ${form.projectDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {form.projectDropdownOpen && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/20 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto">
                    {projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => setForm({ ...form, project_id: proj.id, projectDropdownOpen: false })}
                        className="w-full text-left px-6 py-4 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition font-medium"
                      >
                        {proj.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <textarea
                placeholder="Deskripsi (opsional)"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-6 py-5 rounded-2xl bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 resize-none outline-none focus:border-purple-500"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Assignee"
                  value={form.assignee}
                  onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                  className="px-6 py-5 rounded-2xl bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 outline-none focus:border-purple-500"
                />
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="px-6 py-5 rounded-2xl bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 outline-none focus:border-purple-500"
                />
              </div>

              {/* Status */}
              <div className="relative">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Status</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, dropdownOpen: !form.dropdownOpen })}
                  className="w-full px-6 py-5 rounded-2xl bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-left flex justify-between items-center font-medium outline-none focus:border-purple-500"
                >
                  <span>
                    {form.kanban_status === "todo" ? "To Do" : form.kanban_status === "inprogress" ? "In Progress" : "Done"}
                  </span>
                  <ChevronDown className={`w-5 h-5 transition ${form.dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {form.dropdownOpen && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/20 rounded-2xl shadow-2xl z-50">
                    {["To Do", "In Progress", "Done"].map((label, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          setForm({
                            ...form,
                            kanban_status: ["todo", "inprogress", "done"][i] as any,
                            dropdownOpen: false,
                          })
                        }
                        className="w-full text-left px-6 py-4 hover:bg-purple-100 dark:hover:bg-purple-900/50 font-medium"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-6 mt-10">
              <button
                onClick={closeModal}
                className="px-10 py-4 rounded-2xl font-bold border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !form.project_id || !form.title.trim() || !canEdit}
                className="px-12 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-xl disabled:opacity-50 transition"
              >
                {loading ? "Menyimpan..." : editTask ? "Update Tugas" : "Tambah Tugas"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}