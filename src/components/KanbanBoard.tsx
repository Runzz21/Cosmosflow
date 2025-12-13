import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { supabase } from "../lib/supabase"
import { useStore } from "../store/useStore"

const columns = { todo: "To Do", inprogress: "In Progress", done: "Done" }

export default function KanbanBoard({ projectId }: { projectId: string }) {
  const { tasks, fetchAll } = useStore()
  const userRole = sessionStorage.getItem("user_role");

  const onDragEnd = async (result: any) => {
    if (userRole === 'viewer') return;
    if (!result.destination) return
    await supabase.from("tasks").update({ kanban_status: result.destination.droppableId }).eq("id", result.draggableId)
    fetchAll()
  }

  const projectTasks = tasks.filter(t => t.project_id === projectId)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Kanban Board - Integrasi API
        </h1>
        {userRole !== 'viewer' && (
          <button className="pill">+ Tambah Tugas</button>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-8">
          {Object.entries(columns).map(([key, title]) => (
            <div key={key} className="flex-1">
              <div className="mb-4 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 inline-block">
                <span className="font-semibold">{title} ({projectTasks.filter(t => t.kanban_status === key).length})</span>
              </div>
              <Droppable droppableId={key} isDropDisabled={userRole === 'viewer'}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="kanban-col">
                    {projectTasks.filter(t => t.kanban_status === key).map((task, i) => (
                      <Draggable key={task.id} draggableId={task.id} index={i} isDragDisabled={userRole === 'viewer'}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="task-card">
                            <h3 className="text-xl font-bold mb-2">{task.title}</h3>
                            <p className="text-white/70">{task.description || "Tidak ada deskripsi"}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}