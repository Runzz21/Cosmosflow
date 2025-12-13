// src/pages/Login.tsx → GALAXY BACKGROUND + LOGO ASLI LU GEDE DI TENGAH!
import { useState } from "react"
import toast from "react-hot-toast"
import Galaxy from "../components/Galaxy" 
import logo from "../assets/logo.png" // Logo lu sendiri
import LoadingScreen from "../components/LoadingScreen" // Import loading screen

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Email dan password wajib diisi!")
      return
    }
    setLoading(true)

    setTimeout(() => {
      // Admin role
      if (email.toLowerCase() === "nashrulloh@gmail.com" && password === "acun1230") {
        sessionStorage.setItem("user_role", "admin")
        sessionStorage.setItem("user_name", "Nashrulloh")
        toast.success("Selamat datang, Admin Nashrulloh!")
        window.location.href = "/"
        return
      }

      // Viewer role
      if (email.toLowerCase() === "member@gmail.com" && password === "member123") {
        sessionStorage.setItem("user_role", "viewer")
        sessionStorage.setItem("user_name", "Member")
        toast.success("Selamat datang, Member!")
        window.location.href = "/"
        return
      }

      // Team member role
      const teamEmails = ["dika@gmail.com", "rizky@gmail.com", "fajar@gmail.com", "siti@gmail.com", "bayu@gmail.com"]
      if (teamEmails.includes(email.toLowerCase()) && password === "acun1230") {
        const name = email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)
        sessionStorage.setItem("user_role", "member")
        sessionStorage.setItem("user_name", name)
        toast.success(`Selamat datang, ${name}!`)
        window.location.href = "/"
        return
      }

      // If no match
      toast.error("Email atau password salah!")
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {loading && <LoadingScreen />}

      {/* GALAXY BACKGROUND — BERGERAK & GLOWING GILA! */}
      <div className="absolute inset-0 -z-10">
        <Galaxy transparent={false} saturation={0} />
      </div>

      {/* OVERLAY GELAP BIAR CARD & LOGO KELIATAN JELAS */}
      <div className="fixed inset-0 bg-black/10 z-10 pointer-events-none" />

      {/* CARD LOGIN + LOGO ASLI LU */}
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative z-20">
        <div className="w-full max-w-md sm:max-w-lg">
          <div className="bg-black/40 rounded-3xl shadow-2xl p-8 sm:p-16 border border-purple-500/50">
            {/* GLOW BORDER EFEK */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-cyan-600/30 blur-2xl -z-10" />

            {/* LOGO ASLI LU — GEDE BANGET DI TENGAH! */}
            <div className="text-center mb-8 sm:mb-12">
              <img 
                src={logo} 
                alt="CosmosFlow Logo" 
                className="w-32 h-32 sm:w-64 sm:h-64 mx-auto mb-8 sm:mb-12 rounded-3xl object-cover shadow-2xl border-4 sm:border-8 border-white/30"
                onError={(e) => e.currentTarget.src = "https://via.placeholder.com/256?text=CF"}
              />
              <h1 className="text-5xl sm:text-7xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                
              </h1>
              <p className="mt-4 sm:mt-6 text-lg sm:text-2xl text-white/90 font-medium">Project Management Modern</p>
            </div>

            {/* FORM LOGIN */}
            <form onSubmit={handleLogin} className="space-y-6 sm:space-y-8">
              <input
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 sm:px-8 sm:py-6 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-base sm:text-xl font-medium focus:border-purple-400 focus:ring-4 focus:ring-purple-400/30 outline-none transition"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 sm:px-8 sm:py-6 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-base sm:text-xl font-medium focus:border-purple-400 focus:ring-4 focus:ring-purple-400/30 outline-none transition pr-16 sm:pr-20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-sm sm:text-lg font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 sm:py-8 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-2xl sm:text-3xl shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-70"
              >
                {loading ? "Loading..." : "Masuk ke Dashboard"}
              </button>
            </form>

            {/* INFO LOGIN */}
            <div className="mt-10 sm:mt-14 text-center text-white/80 space-y-3 sm:space-y-4">
              <p className="font-bold text-base sm:text-2xl">Viewer: member@gmail.com (pw: member123)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}