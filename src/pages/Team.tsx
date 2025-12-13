// src/pages/Team.tsx
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import AddTeamMemberForm from "../components/AddTeamMemberForm"
import { Edit2, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

interface Member {
  id: string
  name: string
  role: string
}

export default function Team() {
  const [members, setMembers] = useState<Member[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editMember, setEditMember] = useState<Member | null>(null)
  const userRole = sessionStorage.getItem("user_role");

  const fetchData = async () => {
    const { data, error } = await supabase.from("team").select("id, name, role").order("name")
    if (error) {
      console.error("Error fetching:", error)
      toast.error("Gagal memuat data tim")
    } else {
      setMembers(data || [])
    }
  }

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel("team-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "team" }, () => fetchData())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (userRole === 'viewer') {
      toast.error("Anda tidak memiliki izin untuk menghapus anggota.");
      return;
    }
    if (!confirm(`Yakin hapus "${name}" dari tim?`)) return

    const { error } = await supabase.from("team").delete().eq("id", id)
    if (error) {
      toast.error("Gagal menghapus!")
    } else {
      toast.success(`"${name}" berhasil dihapus!`)
      fetchData()
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-black">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Anggota Tim
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">{members.length} orang aktif</p>
        </div>
        {userRole !== 'viewer' && (
          <button
            onClick={() => {
              setEditMember(null)
              setIsOpen(true)
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xl px-8 py-4 rounded-2xl shadow-xl transition hover:scale-105"
          >
            + Tambah Anggota
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {members.length === 0 ? (
          <p className="col-span-full text-center text-3xl text-gray-500 dark:text-gray-400 mt-20">
            Belum ada anggota tim
          </p>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              className="bg-white dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl font-black text-white shadow-2xl mb-6">
                {m.name[0].toUpperCase()}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{m.name}</h3>
              <p className="text-lg font-medium text-purple-600 dark:text-purple-400">{m.role}</p>

              {userRole !== 'viewer' && (
                <div className="flex justify-center gap-4 mt-8">
                  <button
                    onClick={() => {
                      setEditMember(m)
                      setIsOpen(true)
                    }}
                    className="p-3 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition"
                  >
                    <Edit2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id, m.name)}
                    className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                  >
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isOpen && userRole !== 'viewer' && (
        <AddTeamMemberForm
          member={editMember}
          onClose={() => {
            setIsOpen(false)
            setEditMember(null)
            fetchData()
          }}
        />
      )}
    </div>
  )
}