import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function Analitik() {
  const [tasks, setTasks] = useState<any[]>([])
  const isDark = document.documentElement.classList.contains("dark")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, project:project_id(name)")
    if (error) {
      console.error("Error fetching tasks:", error)
      return
    }
    setTasks(data || [])
  }

  // HITUNG YANG PENTING AJA
  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.kanban_status === "done")

  // Tepat waktu
  const onTimePercentage = doneTasks.length > 0
    ? Math.round(
        doneTasks.filter(t => {
          if (!t.deadline) return true
          const doneAt = t.completed_at ? new Date(t.completed_at) : new Date(t.updated_at)
          return doneAt <= new Date(t.deadline)
        }).length / doneTasks.length * 100
      )
    : 0

  // Rata-rata hari penyelesaian
  const avgDays = doneTasks.length > 0
    ? (doneTasks.reduce((sum, t) => {
        const start = new Date(t.created_at)
        const end = t.completed_at ? new Date(t.completed_at) : new Date(t.updated_at)
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      }, 0) / doneTasks.length).toFixed(1)
    : "0.0"

  // Produktivitas 7 hari terakhir
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const thisWeekDone = doneTasks.filter(t => new Date(t.updated_at) > oneWeekAgo).length

  // Export CSV
  const exportCSV = () => {
    const headers = ["Judul Tugas", "Project", "Penanggung Jawab", "Deadline", "Status", "Dibuat"]
    const rows = tasks.map(t => [
      t.title,
      t.project?.name || "-",
      t.assignee || "-",
      t.deadline ? new Date(t.deadline).toLocaleDateString("id-ID") : "-",
      t.kanban_status === "todo" ? "To Do" : t.kanban_status === "inprogress" ? "In Progress" : "Done",
      new Date(t.created_at).toLocaleDateString("id-ID")
    ])

    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `CosmosFlow_Analitik_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  return (
    <div className={`min-h-screen p-8 ${isDark ? "text-white" : "text-gray-800"}`}>
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className={`text-5xl font-black mb-3 ${isDark ? "text-pink-400" : "text-pink-600"}`}>
            Laporan Analitik
          </h1>
          <p className={`text-xl ${isDark ? "opacity-70" : "opacity-80"}`}>
            Real-time · {totalTasks} tugas
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="px-10 py-5 rounded-full font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl hover:shadow-2xl transition"
        >
          Export CSV
        </button>
      </div>

      {/* 3 CARD AJA — LEBIH BERSIH, LEBIH CEPET */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {[
          { icon: "✓", label: "Tugas Selesai Tepat Waktu", value: `${onTimePercentage}%`, color: "text-green-400" },
          { icon: "⏱", label: "Rata-rata Penyelesaian", value: `${avgDays} Hari`, color: "text-blue-400" },
          { icon: "🏆", label: "Produktivitas Minggu Ini", value: `${thisWeekDone} Tugas`, color: "text-purple-400" },
        ].map((item, i) => (
          <div
            key={i}
            className={`rounded-3xl p-10 text-center border backdrop-blur-xl transition-all hover:scale-105 ${
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-white/90 border-gray-300 shadow-2xl"
            }`}
          >
            <div className={`text-8xl mb-6 ${isDark ? item.color : item.color.replace("400", "600")}`}>
              {item.icon}
            </div>
            <p className={`text-lg ${isDark ? "opacity-70" : "opacity-80"}`}>{item.label}</p>
            <p className="text-5xl font-black mt-4">{item.value}</p>
          </div>
        ))}
      </div>

      {/* TABEL RIWAYAT */}
      <div className={`rounded-3xl p-10 border backdrop-blur-xl ${
        isDark ? "bg-white/5 border-white/10" : "bg-white/90 border-gray-300 shadow-2xl"
      }`}>
        <h3 className="text-3xl font-bold mb-8">Riwayat Tugas</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left ${isDark ? "opacity-70" : "opacity-80"}`}>
                <th className="pb-4 font-semibold">Tugas</th>
                <th className="pb-4 font-semibold">Project</th>
                <th className="pb-4 font-semibold">Penanggung Jawab</th>
                <th className="pb-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-16 text-2xl opacity-50">Belum ada tugas</td></tr>
              ) : (
                tasks.slice(0, 20).map(t => (
                  <tr key={t.id} className={`border-t ${isDark ? "border-white/10" : "border-gray-200"}`}>
                    <td className="py-4 font-medium">{t.title}</td>
                    <td className="py-4">{t.project?.name || "-"}</td>
                    <td className="py-4">{t.assignee || "-"}</td>
                    <td className="py-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        t.kanban_status === "done" 
                          ? "bg-green-500/20 text-green-400" 
                          : t.kanban_status === "inprogress" 
                          ? "bg-blue-500/20 text-blue-400" 
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {t.kanban_status === "todo" ? "To Do" : t.kanban_status === "inprogress" ? "In Progress" : "Done"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}