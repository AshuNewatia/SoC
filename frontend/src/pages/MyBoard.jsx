import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import TaskCard from "../components/myboard/TaskCard";
import CreateTaskModal from "../components/myboard/CreateTaskModal";
import { DragDropContext } from "@hello-pangea/dnd";
import BoardColumn from "../components/myboard/BoardColumn";
import TaskDetailsModal from "../components/myboard/TaskDetailsModal";


const STORAGE_KEY = "myboard_tasks";

const initialTasks = {
  todo: [
    {
      id: 1,
      title: "Research GitHub Webhooks",
      priority: "High",
      dueDate: "2026-06-10",
      tag: "Backend",
    },
  ],
  progress: [
    {
      id: 2,
      title: "Build Task Modal",
      priority: "Medium",
      dueDate: "2026-06-08",
      tag: "Frontend",
    },
  ],
  completed: [
    {
      id: 3,
      title: "Project Planning",
      priority: "Low",
      dueDate: "2026-06-05",
      tag: "Management",
    },
  ],
};

export default function MyBoard() {
 const [tasks, setTasks] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEY);

  return saved ? JSON.parse(saved) : initialTasks;
});
const [showModal, setShowModal] = useState(false);

const handleCreateTask = (newTask) => {
  setTasks((prev) => ({
    ...prev,
    todo: [newTask, ...prev.todo],
  }));
};

const handleDragEnd = (result) => {
  const { source, destination } = result;

  if (!destination) return;

  if (
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  ) {
    return;
  }

  const sourceColumn = [...tasks[source.droppableId]];
  const destinationColumn =
    source.droppableId === destination.droppableId
      ? sourceColumn
      : [...tasks[destination.droppableId]];

  const [movedTask] = sourceColumn.splice(source.index, 1);

  destinationColumn.splice(
    destination.index,
    0,
    movedTask
  );

  setTasks((prev) => ({
    ...prev,
    [source.droppableId]: sourceColumn,
    [destination.droppableId]: destinationColumn,
  }));
};


const [selectedTask, setSelectedTask] = useState(null);
const [showTaskModal, setShowTaskModal] = useState(false);

const handleUpdateTask = (updatedTask) => {
  setTasks((prev) => ({
    todo: prev.todo.map((t) =>
      t.id === updatedTask.id ? updatedTask : t
    ),

    progress: prev.progress.map((t) =>
      t.id === updatedTask.id ? updatedTask : t
    ),

    completed: prev.completed.map((t) =>
      t.id === updatedTask.id ? updatedTask : t
    ),
  }));
};


const handleDeleteTask = (taskId) => {
  setTasks((prev) => ({
    todo: prev.todo.filter((t) => t.id !== taskId),
    progress: prev.progress.filter((t) => t.id !== taskId),
    completed: prev.completed.filter((t) => t.id !== taskId),
  }));
};


const [notes, setNotes] = useState(() => {
  const saved = localStorage.getItem("myboard_notes");

  return saved
    ? JSON.parse(saved)
    : [
        {
          id: 1,
          title: "Welcome Note",
          content:
            "Create your first note using the button below.",
        },
      ];
});

useEffect(() => {
  localStorage.setItem(
    "myboard_notes",
    JSON.stringify(notes)
  );
}, [notes]);

  const stats = {
    total:
      tasks.todo.length +
      tasks.progress.length +
      tasks.completed.length,
    active: tasks.progress.length,
    completed: tasks.completed.length,
  };
  useEffect(() => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks)
  );
}, [tasks]);


const totalTasks =
  tasks.todo.length +
  tasks.progress.length +
  tasks.completed.length;

const completedTasks =
  tasks.completed.length;

const completionPercentage =
  totalTasks === 0
    ? 0
    : Math.round(
        (completedTasks / totalTasks) * 100
      );


const upcomingTasks = [
  ...tasks.todo,
  ...tasks.progress,
]
  .filter((task) => task.dueDate)
  .sort(
    (a, b) =>
      new Date(a.dueDate) - new Date(b.dueDate)
  )
  .slice(0, 5);




  const getDaysRemaining = (date) => {
  const today = new Date();
  const due = new Date(date);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return Math.ceil(
    (due - today) / (1000 * 60 * 60 * 24)
  );
};

const getDeadlineStyle = (date) => {
  const days = getDaysRemaining(date);

  if (days < 0) {
    return {
      badge: "Overdue",
      className:
        "bg-red-100 text-red-700 border-red-200",
    };
  }

  if (days <= 2) {
    return {
      badge: `${days} day${days !== 1 ? "s" : ""} left`,
      className:
        "bg-orange-100 text-orange-700 border-orange-200",
    };
  }

  if (days <= 7) {
    return {
      badge: `${days} days left`,
      className:
        "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
  }

  return {
    badge: `${days} days left`,
    className:
      "bg-green-100 text-green-700 border-green-200",
    };
};


const createNote = () => {
  const newNote = {
    id: Date.now(),
    title: "New Note",
    content: "",
  };

  setNotes((prev) => [newNote, ...prev]);
};

const updateNote = (id, field, value) => {
  setNotes((prev) =>
    prev.map((note) =>
      note.id === id
        ? { ...note, [field]: value }
        : note
    )
  );
};

const deleteNote = (id) => {
  setNotes((prev) =>
    prev.filter((note) => note.id !== id)
  );
};


  return (
    <div className="p-6 lg:p-8 bg-slate-50">
      {/* Page Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            My Board
          </h1>

          <p className="text-slate-500 mt-1">
            Your private productivity workspace
          </p>
        </div>

        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition"  onClick={() => setShowModal(true)}>
          <Plus size={18} />
          New Task
        </button>
      </div>
      <CreateTaskModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onCreateTask={handleCreateTask}
/>

      {/* Stats */}
      

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <Clock3 className="text-blue-600 mb-3" />
          <p className="text-slate-500 text-sm">
            Total Tasks
          </p>
          <h2 className="text-3xl font-bold mt-1">
            {stats.total}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <AlertCircle className="text-orange-500 mb-3" />
          <p className="text-slate-500 text-sm">
            Active Tasks
          </p>
          <h2 className="text-3xl font-bold mt-1">
            {stats.active}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <CheckCircle2 className="text-green-600 mb-3" />
          <p className="text-slate-500 text-sm">
            Completed
          </p>
          <h2 className="text-3xl font-bold mt-1">
            {stats.completed}
          </h2>
        </div>
      </div>
      

      {/* Productivity Widgets */}

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Focus */}

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
  <h2 className="font-semibold text-lg mb-4">
    Upcoming Deadlines
  </h2>

  {upcomingTasks.length === 0 ? (
    <p className="text-slate-400 text-sm">
      No upcoming deadlines.
    </p>
  ) : (
    <div className="space-y-3">
      {upcomingTasks.map((task) => {
        const status = getDeadlineStyle(
          task.dueDate
        );

        return (
          <div
            key={task.id}
            className="border border-slate-200 rounded-xl p-3"
          >
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="font-medium text-slate-800">
                  {task.title}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Due: {task.dueDate}
                </p>
              </div>

              <span
                className={`px-2 py-1 text-xs rounded-lg border ${status.className}`}
              >
                {status.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>

        {/* Notes */}

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-semibold text-lg">
      Quick Notes
    </h2>

    <button
      onClick={createNote}
      className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg"
    >
      <Plus size={14} />
      New Note
    </button>
  </div>

  <div className="space-y-4 max-h-[400px] overflow-y-auto">
    {notes.map((note) => (
      <div
        key={note.id}
        className="border border-slate-200 rounded-xl p-3"
      >
        <div className="flex justify-between items-center mb-2">
          <input
            value={note.title}
            onChange={(e) =>
              updateNote(
                note.id,
                "title",
                e.target.value
              )
            }
            className="font-semibold w-full outline-none"
          />

          <button
            onClick={() => deleteNote(note.id)}
            className="text-red-500 ml-2"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <textarea
          rows={3}
          value={note.content}
          onChange={(e) =>
            updateNote(
              note.id,
              "content",
              e.target.value
            )
          }
          placeholder="Write something..."
          className="w-full resize-none outline-none text-sm text-slate-600"
        />
      </div>
    ))}
  </div>
</div>

        {/* Goals */}

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-lg mb-4">
            Monthly Goal
          </h2>

          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full"
              style={{ width: "70%" }}
            />
          </div>

          <p className="mt-3 text-sm text-slate-500">
            70% completed
          </p>
        </div>
      </div>

      

      {/* Personal Kanban */}
<div>
  <div className="bg-white rounded-2xl p-5 border border-slate-200 mb-8">
  <div className="flex justify-between mb-3">
    <h3 className="font-semibold">
      Productivity Progress
    </h3>

    <span className="font-bold">
      {completionPercentage}%
    </span>
  </div>

  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
    <div
      className="h-full bg-green-500 transition-all duration-500"
      style={{
        width: `${completionPercentage}%`,
      }}
    />
  </div>
</div>
  <h2 className="text-xl font-semibold text-slate-900 mb-5">
    Personal Tasks
  </h2>

  <DragDropContext onDragEnd={handleDragEnd}>
    <div className="grid lg:grid-cols-3 gap-6">
      <BoardColumn
        columnId="todo"
        title="To Do"
        tasks={tasks.todo}
         onDelete={handleDeleteTask}
         onOpen={(task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  }}
        titleClass="text-slate-700"
      />

      <BoardColumn
        columnId="progress"
        title="In Progress"
        tasks={tasks.progress}
         onDelete={handleDeleteTask}
         onOpen={(task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  }}
        titleClass="text-blue-600"
      />

      <BoardColumn
        columnId="completed"
        title="Completed"
        tasks={tasks.completed}
         onDelete={handleDeleteTask}
         onOpen={(task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  }}
        titleClass="text-green-600"
      />
    </div>
  </DragDropContext>
</div>
<TaskDetailsModal
  task={selectedTask}
  isOpen={showTaskModal}
  onClose={() => setShowTaskModal(false)}
  onSave={handleUpdateTask}
/>
    </div>
  );
}