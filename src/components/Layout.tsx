// src/components/Layout.tsx → LOGO DOANG, GEDE, CANTIK, NO ERROR!
import { useState, useEffect } from "react"
import { Moon, Sun, LayoutDashboard, FolderOpen, Users, BarChart3, LogOut } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import toast from "react-hot-toast"
import Header from "./Header"
import logo from "../assets/logo.png" // Ini pasti jalan kalau file ada!

const menu = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderOpen, label: "Project Overview" },
  { to: "/team", icon: Users, label: "Anggota Tim" },
  { to: "/analitik", icon: BarChart3, label: "Laporan Analitik" },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const location = useLocation()

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleLogout = () => {
    sessionStorage.clear()
    localStorage.clear()

    toast.success("Berhasil logout! Sampai jumpa lagi 👋", {
      duration: 3000,
      style: { background: "linear-gradient(to right, #10b981, #34d399)", color: "white" },
    })

    setTimeout(() => {
      window.location.href = "/login"
    }, 500) // Give toast time to show
  }

  return (
    <div className={`min-h-screen transition-all duration-700 ${isDark ? "bg-[#0a021a]" : "bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"} text-${isDark ? "white" : "gray-900"} overflow-x-hidden`}>
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {isDark ? (
          <>
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/40 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/30 blur-3xl rounded-full" />
          </>
        ) : (
          <>
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400/30 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-400/30 blur-3xl rounded-full" />
          </>
        )}
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 ${isMobile ? "w-full max-w-xs" : "w-80"} ${isDark ? "bg-black/40" : "bg-white/70"} backdrop-blur-2xl border-r ${isDark ? "border-white/10" : "border-gray-200/50"} z-40 transition-transform duration-300 ease-in-out ${isMobile ? (isSidebarOpen ? "translate-x-0" : "-translate-x-full") : ""}`}>
        <div className="p-8 h-full flex flex-col">
          {/* LOGO DOANG — GEDE & CANTIK! */}
          <div className="flex justify-center mb-20">
            <div className="relative">
              <img 
                src={logo} 
                alt="CosmosFlow Logo" 
                className="w-40 h-40 rounded-3xl object-cover shadow-2xl border-4 border-white/20"
                onError={(e) => {
                  // Fallback kalau logo gagal load
                  e.currentTarget.src = "https://via.placeholder.com/160/9333EA/FFFFFF?text=CF"
                  e.currentTarget.classList.add("bg-gradient-to-br", "from-purple-600", "to-pink-600")
                }}
              />
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-60 blur-2xl -z-10" />
            </div>
          </div>

          {/* Menu Sidebar */}
          <nav className="space-y-4 flex-1">
            {menu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-6 py-5 rounded-2xl transition-all duration-300 font-medium text-lg ${
                    isActive
                      ? "bg-purple-600/80 text-white shadow-xl"
                      : isDark
                      ? "hover:bg-white/10"
                      : "hover:bg-purple-100"
                  }`
                }
                onClick={() => isMobile && setIsSidebarOpen(false)}
              >
                <item.icon className="w-6 h-6" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* TOMBOL LOGOUT */}
          <button
            onClick={handleLogout}
            className="w-full mt-12 flex items-center justify-center gap-4 px-6 py-6 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl group border border-red-500/30"
          >
            <LogOut className="w-7 h-7 group-hover:rotate-180 transition-transform duration-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`${isMobile ? "ml-0" : "ml-80"} min-h-screen p-4 sm:p-10`}>
                <Header
                  isDark={isDark}
                  toggleDark={() => setIsDark(!isDark)}
                  isMobile={isMobile}
                  toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                  currentPagePath={location.pathname}
                />        <div className="animate-fadeIn mt-8">
          {children}
        </div>
      </main>
    </div>
  )
}