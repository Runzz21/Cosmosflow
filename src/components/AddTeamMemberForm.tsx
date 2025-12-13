// src/components/AddTeamMemberForm.tsx
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { X, ChevronDown } from "lucide-react"
import toast from "react-hot-toast"

interface Member {
  id?: string
  name: string
  role: string
}

interface Props {
  member: Member | null
  onClose: () => void
}

const roles = ["Member", "Project Manager", "Frontend Dev", "Backend Dev", "UI/UX Designer", "DevOps"]

export default function AddTeamMemberForm({ member, onClose }: Props) {
  const [form, setForm] = useState({ name: "", role: "Member" })
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (member) {
      setForm({ name: member.name, role: member.role })
    } else {
      setForm({ name: "", role: "Member" })
    }
  }, [member])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userRole = sessionStorage.getItem("user_role");
    if (userRole === 'viewer') {
      toast.error("Anda tidak memiliki izin untuk melakukan aksi ini.");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Nama wajib diisi!")
      return
    }

    setLoading(true)

    const payload = { name: form.name.trim(), role: form.role }

    try {
      if (member?.id) {
        const { error } = await supabase.from("team").update(payload).eq("id", member.id)
        if (error) throw error
        toast.success(`"${form.name}" berhasil diperbarui!`)
      } else {
        const { error } = await supabase.from("team").insert(payload)
        if (error) throw error
        toast.success(`"${form.name}" berhasil ditambahkan ke tim!`)
      }
      onClose()
    } catch (err: any) {
      console.error("Error:", err)
      toast.error("Gagal menyimpan: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-gray-200 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {member ? "Edit Anggota" : "Tambah Anggota Baru"}
          </h2>
          <button onClick={onClose} className="p-3 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            required
            placeholder="Nama Lengkap"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-5 py-4 rounded-2xl bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 focus:border-purple-500 outline-none transition"
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="w-full px-5 py-4 rounded-2xl bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-left flex justify-between items-center text-gray-900 dark:text-white"
            >
              {form.role}
              <ChevronDown className={`w-5 h-5 transition ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/20 rounded-2xl shadow-2xl z-10 overflow-hidden">
                {roles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, role: r })
                      setOpen(false)
                    }}
                    className="w-full text-left px-5 py-4 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-gray-900 dark:text-white transition"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-xl disabled:opacity-70 transition"
            >
              {loading ? "Menyimpan..." : member ? "Update" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}