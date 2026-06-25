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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-[70vh] flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Icon size={17} className="text-slate-500" />
          <h3 className={`font-semibold text-sm ${titleClass}`}>
            {title}
          </h3>
        </div>

        <span className="min-w-6 h-6 px-2 rounded-full bg-slate-100 text-slate-600 text-xs flex items-center justify-center font-medium">
          {tasks.length}
        </span>
      </div>

      {/* Scrollable Task Area */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-4 space-y-3 transition-colors duration-200 ${
              snapshot.isDraggingOver ? "bg-primary/5" : ""
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                <div className="text-4xl mb-2">📌</div>
                <p className="text-sm text-slate-500">
                  No tasks here
                </p>
              </div>
            )}

                       {tasks.map((task, index) => (
              <Draggable
  key={task?._id?.toString() || `task-${index}`}
  draggableId={task?._id?.toString() || `task-${index}`}
  index={index}
>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard
                      task={task}
                      onDelete={onDelete}
                      onOpen={onOpen}
                    />
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
