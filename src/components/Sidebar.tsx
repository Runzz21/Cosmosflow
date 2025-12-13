// src/components/Sidebar.tsx → TOMBOL LOGOUT PASTI ADA & KERJA!
import { LayoutDashboard, FolderOpen, Users, Calendar, LogOut } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import toast from "react-hot-toast"

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    toast.success("Logout berhasil!", { icon: "Success" })
    navigate("/login")
  }

  return (
    <aside className="fixed inset-y-0 left-0 top-16 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50">
      <div className="flex flex-col h-full">
        {/* MENU ATAS */}
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-medium text-lg ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
                }`
              }
            >
              <Icon className="w-6 h-6" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* TOMBOL LOGOUT — INI YANG LU CARI, PASTI KELIHATAN! */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-4 px-6 py-5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-lg shadow-xl transition-all duration-300 hover:scale-105"
          >
            <LogOut className="w-6 h-6" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>
    </aside>
  )
}