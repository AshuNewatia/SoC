import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import {
  Circle,
  Clock3,
  CheckCircle2,
} from "lucide-react";


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
}) 

{
const Icon = columnIcons[columnId] || Circle;

  return (
    <div className="bg-slate-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-2">
    <Icon size={18} />
    <h3 className={`font-semibold ${titleClass}`}>
      {title}
    </h3>
  </div>

  <span className="px-2 py-1 text-xs bg-white rounded-lg border">
    {tasks.length}
  </span>
</div>

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-4 min-h-[200px] rounded-xl transition ${
              snapshot.isDraggingOver ? "bg-slate-200" : ""
            }`}
          >
            {tasks.length === 0 && (
  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm">
    Drop tasks here
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