// src/components/Header.tsx
import { Moon, Sun, Bell, Menu } from "lucide-react"
import { useState } from "react"

interface HeaderProps {
  isDark: boolean
  toggleDark: () => void
  isMobile: boolean
  toggleSidebar: () => void
  currentPagePath: string
}

export default function Header({ isDark, toggleDark, isMobile, toggleSidebar, currentPagePath }: HeaderProps) {
  const [showInfoModal, setShowInfoModal] = useState(false)
  // AMBIL DATA USER DARI sessionStorage (dari login)
  const userName = sessionStorage.getItem("user_name") || "Pengguna"
  const userRole = sessionStorage.getItem("user_role")

  const getRoleText = () => {
    if (userRole === "admin") return "Project Manager"
    if (userRole === "member") return "Anggota Tim"
    return "Guest"
  }

  const getInitial = () => {
    return userName.charAt(0).toUpperCase()
  }

  const pageTitles: { [key: string]: string } = {
    "/": "Dashboard Utama",
    "/projects": "Project Overview",
    "/team": "Anggota Tim",
    "/analitik": "Laporan Analitik",
  }

  const getCurrentPageTitle = (path: string): string => {
    return pageTitles[path] || "Dashboard Utama"
  }

  return (
    <>
    <header className={`mb-10 p-6 rounded-3xl flex justify-between items-center backdrop-blur-xl shadow-2xl border ${
      isDark 
        ? "bg-white/5 border-white/10" 
        : "bg-white/70 border-gray-200"
    }`}>
      {/* Kiri: Judul + Salam */}
      <div className="flex items-center gap-4">
        {isMobile && (
          <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-white/10">
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent">
            {getCurrentPageTitle(currentPagePath)}
          </h2>
          <p className="text-lg opacity-80 mt-2">
            Selamat datang, <span className="font-bold text-purple-400">{userName}</span>!
          </p>
        </div>
      </div>

      {/* Kanan: Notif + Dark Mode + Profile + Logout */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          onClick={() => setShowInfoModal(!showInfoModal)}
          className="relative p-4 rounded-2xl hover:bg-white/10 dark:hover:bg-white/10 transition"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDark}
          className={`p-4 rounded-2xl transition-all duration-500 shadow-lg ${
            isDark 
              ? "bg-white/10 hover:bg-white/20" 
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {isDark ? (
            <Sun className="w-6 h-6 text-yellow-400" />
          ) : (
            <Moon className="w-6 h-6 text-purple-700" />
          )}
        </button>

        {/* User Info + Avatar */}
        {!isMobile && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-bold text-lg">{userName}</p>
              <p className="text-sm opacity-70">{getRoleText()}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 p-0.5 shadow-xl">
              <div className="w-full h-full rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-2xl font-black text-white dark:text-black">
                {getInitial()}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>

    {showInfoModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className={`p-6 rounded-2xl shadow-xl w-11/12 md:w-1/2 lg:w-1/3 ${
            isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
          }`}>
          <h3 className="text-2xl font-bold mb-4">Tentang Web Ini & Petunjuk</h3>
          <p className="mb-4">
            Ini adalah website manajemen proyek yang membantu tim untuk mengelola tugas, melacak progres, dan berkolaborasi secara efisien.
          </p>
          <h4 className="text-xl font-semibold mb-2">Petunjuk Penggunaan:</h4>
          <ul className="list-disc list-inside mb-4">
            <li><strong>Ganti tema terang/gelap menggunakan tombol di sebelah Notifikasi.</strong></li>
            <li><strong>Sidebar Kiri</strong>: Navigasi ke Dashboard, Projects, Team, Analytics. </li>
            <li><strong>Filter & Search</strong>: Gunakan search bar untuk cari project cepat</li>
            <li><strong>Export Laporan</strong>: Klik tombol "Export CSV" di halaman Laporan Analitik</li>
            <li><strong>Logout</strong>: Klik Sidebar di Kiri atas → Logout</li>
            <li><strong>Responsif</strong>: Bisa dipakai di HP dan Desktop!</li>
          </ul>
          <button
            onClick={() => setShowInfoModal(false)}
            className={`mt-4 px-4 py-2 rounded-lg ${
                isDark ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-purple-100 hover:bg-purple-200 text-purple-800"
              } transition`}
          >
            Tutup
          </button>
        </div>
      </div>
    )}
    </>
  )
}