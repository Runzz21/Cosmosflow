import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface Task {
  id: string
  title: string
  description?: string
  kanban_status: 'todo' | 'inprogress' | 'done'
  project_id: string
}

interface Project {
  id: string
  name: string
  description?: string
  deadline?: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  skills: string[]
  avatar_url?: string
}

interface Store {
  darkMode: boolean
  toggleDarkMode: () => void
  projects: Project[]
  tasks: Task[]
  team: TeamMember[]
  loading: boolean
  fetchAll: () => Promise<void>
  selectedProject: string | null
  setSelectedProject: (id: string | null) => void
}

export const useStore = create<Store>((set) => ({
  darkMode: localStorage.getItem('darkMode') === 'true',
  projects: [],
  tasks: [],
  team: [],
  loading: true,
  selectedProject: null,
  setSelectedProject: (id) => set({ selectedProject: id }),

  toggleDarkMode: () => {
    const newMode = !useStore.getState().darkMode
    localStorage.setItem('darkMode', String(newMode))
    document.documentElement.classList.toggle('dark', newMode)
    set({ darkMode: newMode })
  },

  fetchAll: async () => {
    set({ loading: true })
    const [{ data: projects }, { data: tasks }, { data: team }] = await Promise.all([
      supabase.from('projects').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('team_members').select('*')
    ])
    set({ projects: projects || [], tasks: tasks || [], team: team || [], loading: false })
  }
}))