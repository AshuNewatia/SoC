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
  const hasTasks = tasks.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-border-light shadow-sm hover:shadow-md transition-all duration-300 min-h-[500px] lg:h-[70vh] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-light flex-shrink-0">
        <div className="flex items-center gap-2">
          <Icon size={17} className="text-text-secondary" />
          <h3 className={`font-semibold text-sm ${titleClass}`}>
            {title}
          </h3>
        </div>

        <span className={`min-w-6 h-6 px-2 rounded-full text-xs flex items-center justify-center font-medium ${
          hasTasks ? "bg-primary/10 text-primary" : "bg-slate-100 text-text-secondary"
        }`}>
          {tasks.length}
        </span>
      </div>

      {/* Scrollable Task Area */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-4 space-y-3 transition-all duration-200 ${
              snapshot.isDraggingOver 
                ? "bg-primary/5 ring-2 ring-primary/20 rounded-xl" 
                : ""
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border-light rounded-xl">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-sm text-text-secondary">
                  No tasks yet
                </p>
                {columnId === "todo" && (
                  <p className="text-xs text-text-secondary mt-1">Drag tasks here or create new ones</p>
                )}
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