// src/App.tsx → VERSI BRUTAL ANTI CHEAT!
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import ProjectOverview from "./pages/Projects"
import Team from "./pages/Team"
import Analitik from "./pages/Analitik"
import Login from "./pages/Login"

export default function App() {
  // CEK LOGIN DARI sessionStorage (hilang saat tab ditutup)
  const isLoggedIn = (() => {
    const role = sessionStorage.getItem("user_role")
    return role === "admin" || role === "member" || role === "viewer"
  })()

  // ← NGGAK PAKAI useState BIAR SELALU UPDATE REAL-TIME

  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        {/* LOGIN PAGE */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" replace /> : <Login />}
        />

        {/* DASHBOARD & SEMUA HALAMAN */}
        <Route
          path="/*"
          element={
            isLoggedIn ? (
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/projects" element={<ProjectOverview />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/analitik" element={<Analitik />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  )
}