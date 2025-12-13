// src/pages/Dashboard.tsx → VERSI FINAL 100% JALAN, NGGAK ADA ERROR!
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Search, FolderOpen, Users, CheckCircle, Clock, Flame, Trophy } from "lucide-react"

interface Task {
  id: string
  project_id: string
  title: string
  assignee?: string | null
  kanban_status: string
  deadline?: string | null
  created_at: string
  updated_at: string
  projects?: { name: string } | null
}

interface TeamMember {
  id: string
  name: string
  role?: string
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "todo" | "inprogress" | "done">("all")

  const isDark = document.documentElement.classList.contains("dark")

  useEffect(() => {
    const fetchData = async () => {
      const { data: taskData } = await supabase
        .from("tasks")
        .select("*, projects(name)")
        .order("created_at", { ascending: false })

      const { data: teamData } = await supabase
        .from("team")
        .select("id, name, role")

      setTasks(taskData || [])
      setTeam(teamData || [])
    }

    fetchData()

    const channel = supabase
      .channel("dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "team" }, fetchData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // GROUP PROJECT DENGAN NAMA ASLI
  const projectMap = new Map<string, { name: string; todo: number; inprogress: number; done: number; total: number }>()

  tasks.forEach((task) => {
    const projectId = task.project_id
    const projectName = task.projects?.name || `Project ${projectId.slice(0, 8)}`

    if (!projectMap.has(projectId)) {
      projectMap.set(projectId, {
        name: projectName,
        todo: 0,
        inprogress: 0,
        done: 0,
        total: 0,
      })
    }

    const proj = projectMap.get(projectId)!
    if (task.kanban_status === "todo") proj.todo++
    if (task.kanban_status === "inprogress") proj.inprogress++
    if (task.kanban_status === "done") proj.done++

    proj.total = proj.todo + proj.inprogress + proj.done
  })

  const projectsList = Array.from(projectMap, ([id, data]) => ({
    id,
    title: data.name,
    todo: data.todo,
    inprogress: data.inprogress,
    done: data.done,
    total: data.total,
  }))

  // Filter
  const filteredProjects = projectsList
    .filter((p) => {
      if (activeTab === "all") return true
      if (activeTab === "todo") return p.todo > 0
      if (activeTab === "inprogress") return p.inprogress > 0
      if (activeTab === "done") return p.done === p.total && p.total > 0
      return true
    })
    .filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()))

  // Statistik
  const totalTasks = tasks.length
  const todoCount = tasks.filter((t) => t.kanban_status === "todo").length
  const inProgressCount = tasks.filter((t) => t.kanban_status === "inprogress").length
  const doneCount = tasks.filter((t) => t.kanban_status === "done").length

  const doneTasks = tasks.filter((t) => t.kanban_status === "done")
  const onTimePercentage =
    doneTasks.length > 0
      ? Math.round(
          (doneTasks.filter((t) => !t.deadline || new Date(t.updated_at) <= new Date(t.deadline)).length /
            doneTasks.length) *
            100
        )
      : 0

  const avgDays =
    doneTasks.length > 0
      ? (
          doneTasks.reduce(
            (a, t) => a + (new Date(t.updated_at).getTime() - new Date(t.created_at).getTime()),
            0
          ) /
          doneTasks.length /
          86400000
        ).toFixed(1)
      : "0"

  const thisWeekDone = doneTasks.filter(
    (t) => new Date(t.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length

  return (
    <div className={`min-h-screen p-6 lg:p-10 ${isDark ? "bg-gray-950" : "bg-gradient-to-br from-purple-50 to-pink-50"}`}>
      <h1 className="text-4xl sm:text-6xl font-black mb-8 sm:mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Dashboard Utama
      </h1>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-12 sm:mb-16">
        {[
          { icon: "≡", label: "Total Tugas", value: totalTasks, color: "from-purple-500 to-pink-500" },
          { icon: "⏳", label: "To Do", value: todoCount, color: "from-yellow-500 to-orange-500" },
          { icon: "↻", label: "In Progress", value: inProgressCount, color: "from-blue-500 to-cyan-500" },
          { icon: "✓", label: "Done", value: doneCount, color: "from-green-500 to-emerald-500" },
        ].map((stat, i) => (
          <div
            key={i}
            className={`group relative rounded-2xl sm:rounded-3xl p-4 sm:p-10 text-center border-2 backdrop-blur-2xl transition-all duration-500 hover:scale-110 hover:shadow-2xl ${
              isDark ? "bg-white/5 border-white/10" : "bg-white/90 border-gray-200"
            }`}
          >
            <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-30 transition-opacity`}></div>
            <div className="relative z-10">
              <div className="text-5xl sm:text-8xl mb-4 sm:mb-6 flex justify-center items-center">
                <span className="drop-shadow-2xl">{stat.icon}</span>
              </div>
              <p className={`text-sm sm:text-lg font-medium mb-2 sm:mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                {stat.label}
              </p>
              <p className={`text-5xl sm:text-7xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* PROJECT SECTION */}
      <div className={`rounded-3xl p-6 sm:p-10 border backdrop-blur-2xl shadow-2xl mb-12 sm:mb-16 ${isDark ? "bg-black/40 border-white/5" : "bg-white/70 border-gray-200/50"}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black flex items-center gap-3 sm:gap-4">
              <FolderOpen className="w-8 h-8 sm:w-12 sm:h-12 text-purple-400 drop-shadow-lg" />
              Project Overview
            </h2>
            <p className="mt-2 sm:mt-3 text-base sm:text-xl opacity-60">{filteredProjects.length} project aktif</p>
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
            <input
              type="text"
              placeholder="Cari project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 sm:pl-16 pr-6 sm:pr-8 py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-medium transition-all focus:ring-4 focus:ring-purple-500/40 outline-none border ${
                isDark
                  ? "bg-white/5 border-white/10 placeholder-gray-500 text-white"
                  : "bg-white/80 border-gray-300/50 placeholder-gray-500 text-gray-900"
              }`}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-12">
          {["all", "todo", "inprogress", "done"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold text-sm sm:text-lg transition-all duration-300 relative overflow-hidden ${
                activeTab === tab ? "text-white scale-105 shadow-2xl" : "text-gray-400 bg-white/5 hover:bg-white/10"
              }`}
            >
              {activeTab === tab && (
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    tab === "all"
                      ? "from-purple-500 to-pink-500"
                      : tab === "todo"
                      ? "from-yellow-500 to-orange-500"
                      : tab === "inprogress"
                      ? "from-blue-500 to-cyan-500"
                      : "from-green-500 to-emerald-500"
                  } opacity-90`}
                />
              )}
              <span className="relative z-10">
                {tab === "all" ? "All Project" : tab === "todo" ? "To Do" : tab === "inprogress" ? "In Progress" : "Done"}
              </span>
            </button>
          ))}
        </div>

        {/* PROJECT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-20 sm:py-32">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                <FolderOpen className="w-12 h-12 sm:w-16 sm:h-16 text-purple-500 opacity-50" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold opacity-30">
                {searchTerm ? "Project tidak ditemukan" : "Belum ada project"}
              </p>
            </div>
          ) : (
            filteredProjects.map((p) => (
              <div
                key={p.id}
                className="group relative rounded-3xl overflow-hidden border backdrop-blur-2xl transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:border-purple-500/30"
                style={{
                  background: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-black mb-6 sm:mb-10 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    {p.title}
                  </h3>

                  <div className="grid grid-cols-3 gap-3 sm:gap-5">
                    <div className="text-center">
                      <div className="rounded-2xl py-4 sm:py-6 bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-xl">
                        <p className="text-3xl sm:text-5xl font-black text-yellow-400">{p.todo}</p>
                        <p className="text-xs mt-1 sm:mt-2 uppercase tracking-wider opacity-70">To Do</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="rounded-2xl py-4 sm:py-6 bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl">
                        <p className="text-3xl sm:text-5xl font-black text-blue-400">{p.inprogress}</p>
                        <p className="text-xs mt-1 sm:mt-2 uppercase tracking-wider opacity-70">Progress</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="rounded-2xl py-4 sm:py-6 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl">
                        <p className="text-3xl sm:text-5xl font-black text-emerald-400">{p.done}</p>
                        <p className="text-xs mt-1 sm:mt-2 uppercase tracking-wider opacity-70">Done</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-10 text-center">
                    <p className="text-base sm:text-lg font-bold text-gray-400">
                      Total:{" "}
                      <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {p.total}
                      </span>{" "}
                      tugas
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* TIM & ANALITIK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className={`rounded-3xl p-6 sm:p-10 border backdrop-blur-2xl shadow-2xl ${isDark ? "bg-black/40 border-white/5" : "bg-white/70 border-gray-200/50"}`}>
          <h2 className="text-3xl sm:text-4xl font-black mb-8 sm:mb-10 flex items-center gap-3 sm:gap-4">
            <Users className="w-8 h-8 sm:w-12 sm:h-12 text-purple-400" />
            Anggota Tim ({team.length})
          </h2>
          {team.length === 0 ? (
            <p className="text-center py-16 sm:py-20 text-xl sm:text-2xl opacity-40">Belum ada anggota tim</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {team.map((m) => (
                <div key={m.id} className="flex items-center gap-4 sm:gap-5 p-4 sm:p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-2xl">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl font-bold">{m.name}</p>
                    <p className="text-sm opacity-70">{m.role || "Member"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`rounded-3xl p-6 sm:p-10 border backdrop-blur-2xl shadow-2xl ${isDark ? "bg-black/40 border-white/5" : "bg-white/70 border-gray-200/50"}`}>
          <h2 className="text-3xl sm:text-4xl font-black mb-8 sm:mb-10">Analitik</h2>
          <div className="grid grid-cols-2 gap-6 sm:gap-8">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 sm:w-20 sm:h-20 text-green-500 mx-auto mb-3 sm:mb-4" />
              <p className="text-3xl sm:text-5xl font-black text-green-400">{onTimePercentage}%</p>
              <p className="mt-2 sm:mt-3 text-sm sm:text-lg opacity-80">Tepat Waktu</p>
            </div>
            <div className="text-center">
              <Clock className="w-12 h-12 sm:w-20 sm:h-20 text-blue-500 mx-auto mb-3 sm:mb-4" />
              <p className="text-3xl sm:text-5xl font-black text-blue-400">{avgDays}</p>
              <p className="mt-2 sm:mt-3 text-sm sm:text-lg opacity-80">Rata-rata Hari</p>
            </div>
            <div className="text-center">
              <Flame className="w-12 h-12 sm:w-20 sm:h-20 text-orange-500 mx-auto mb-3 sm:mb-4" />
              <p className="text-3xl sm:text-5xl font-black text-orange-400">{thisWeekDone}</p>
              <p className="mt-2 sm:mt-3 text-sm sm:text-lg opacity-80">Minggu Ini</p>
            </div>
            <div className="text-center">
              <Trophy className="w-12 h-12 sm:w-20 sm:h-20 text-purple-500 mx-auto mb-3 sm:mb-4" />
              <p className="text-3xl sm:text-5xl font-black text-purple-400">{doneCount}</p>
              <p className="mt-2 sm:mt-3 text-sm sm:text-lg opacity-80">Total Selesai</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}