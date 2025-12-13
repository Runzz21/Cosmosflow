import { useState } from "react"
import { supabase } from "../lib/supabase"
import { X } from "lucide-react"

interface Props {
  onClose: () => void
  onSuccess?: () => void
  projectId: string
}

export default function TaskModal({ onClose, onSuccess, projectId }: Props) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignee, setAssignee] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userRole = sessionStorage.getItem("user_role");
    if (userRole === 'viewer') {
      alert("Anda tidak memiliki izin untuk melakukan aksi ini.");
      return;
    }
    setLoading(true)

    const { error } = await supabase.from("tasks").insert({
      project_id: projectId,
      title,
      description,
      kanban_status: "To Do",
      assignee_id: assignee || null,
    })

    setLoading(false)
    if (!error) {
      onSuccess?.()
      onClose()
    } else {
      alert("Error: " + error.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Buat Task Baru</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Judul Task</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-lg"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Deskripsi</label>
            <textarea
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-70"
            >
              {loading ? "Membuat..." : "Buat Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}