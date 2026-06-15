import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import { Circle, Clock3, CheckCircle2 } from "lucide-react";

const columnIcons = {
  todo: Circle,
  progress: Clock3,
  completed: CheckCircle2,
};

export default function BoardColumn({
  columnId,
  title,
  tasks,
  onDelete,
  onOpen,
  titleClass = "",
}) {
  const Icon = columnIcons[columnId] || Circle;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-slate-500" />
          <h3 className={`font-semibold text-sm ${titleClass}`}>{title}</h3>
        </div>
        <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto pr-1 space-y-3 rounded-lg transition-colors duration-200 ${
              snapshot.isDraggingOver ? "bg-primary/5" : ""
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="border-2 border-dashed border-border-light rounded-lg p-8 text-center">
                <div className="text-4xl mb-2">📌</div>
                <p className="text-text-secondary text-sm">No tasks here</p>
                <p className="text-xs text-text-secondary/70 mt-1">Drag tasks into this column</p>
              </div>
            )}

            {tasks.map((task, index) => (
              <Draggable
                key={task.id.toString()}
                draggableId={task.id.toString()}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard task={task} onDelete={onDelete} onOpen={onOpen} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}