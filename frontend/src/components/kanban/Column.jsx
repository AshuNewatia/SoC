import { motion } from "framer-motion";
import { Plus, ClipboardList } from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";

const columnConfig = {
  todo: { dot: "bg-slate-500" },
  progress: { dot: "bg-blue-500" },
  completed: { dot: "bg-emerald-500" },
};

export default function Column({ column, onCreateTask, onTaskClick }) {
  const config = columnConfig[column.id] || columnConfig.todo;

  return (
    <motion.div className="min-w-85 w-85 h-[calc(100vh-220px)] rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${config.dot}`} />
            <h2 className="font-semibold text-slate-800">{column.title}</h2>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            {column.tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-4 space-y-4 transition-colors ${
              snapshot.isDraggingOver ? "bg-slate-50" : ""
            }`}
          >
            {column.tasks.length === 0 && (
              <div className="border-2 border-dashed border-border-light rounded-lg p-8 text-center">
                <div className="text-4xl mb-2">📌</div>
                <p className="text-text-secondary text-sm">No tasks here</p>
                <p className="text-xs text-text-secondary/70 mt-1">Drag tasks into this column</p>
              </div>
            )}
            {column.tasks.map((task, index) => (
              <Draggable
                key={task._id || task.id}
                draggableId={String(task._id || task.id)}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                    className={snapshot.isDragging ? "z-50" : ""}
                  >
                    <TaskCard task={task} onClick={() => onTaskClick?.(task)} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Footer removed – no "Add Task" button */}
    </motion.div>
  );
}