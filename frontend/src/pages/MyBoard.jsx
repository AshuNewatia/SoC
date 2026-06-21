import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { launchConfetti } from "../utils/confetti";
import CreateTaskModal from "../components/myboard/CreateTaskModal";
import { DragDropContext } from "@hello-pangea/dnd";
import BoardColumn from "../components/myboard/BoardColumn";
import TaskDetailsModal from "../components/myboard/TaskDetailsModal";
import DeadlineCalendar from "../components/myboard/DeadlineCalendar";

import {
  getMyTasks,
  createPersonalTask,
  updatePersonalTask,
  deletePersonalTask,
} from "../api/personalTaskApi";

const STORAGE_KEY = "myboard_tasks";



export default function MyBoard() {

 const loadTasks = async () => {
  try {
    const { data } = await getMyTasks();

    const grouped = {
      todo: [],
      progress: [],
      completed: [],
    };

    data.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    setTasks(grouped);
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  loadTasks();
}, []);

  const [tasks, setTasks] = useState({
  todo: [],
  progress: [],
  completed: [],
});

  const [showModal, setShowModal] = useState(false);

const handleCreateTask = async (newTask) => {
  try {
    const { data } = await createPersonalTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      tag: newTask.tag,
      dueDate: newTask.dueDate,
      status: "todo",
    });

    setTasks((prev) => ({
      ...prev,
      todo: [data, ...prev.todo],
    }));

    addActivity(`Created task "${data.title}"`);
  } catch (error) {
    console.error(error);
  }
};

  const handleDragEnd = async (result) => {
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
    const updatedTask = {
      ...movedTask,
      status: destination.droppableId,
      activity: [
        ...(movedTask.activity || []),
        {
          action: `Moved to ${destination.droppableId}`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

if (
  destination.droppableId === "completed" &&
  source.droppableId !== "completed"
) {
  launchConfetti();

  setCompletedTaskName(movedTask.title);
  setShowToast(true);

  addActivity(`🎉 Completed "${movedTask.title}"`);

  setTimeout(() => {
    setShowToast(false);
  }, 3000);
}


try {
  await updatePersonalTask(movedTask._id, {
    status: destination.droppableId,
  });
} catch (error) {
  console.error(error);
}

    destinationColumn.splice(destination.index, 0, updatedTask);

    setTasks((prev) => ({
      ...prev,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destinationColumn,
    }));
  };

  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);


  const handleUpdateTask = async (updatedTask) => {
  try {
    await updatePersonalTask(updatedTask._id, updatedTask);

    loadTasks();

    addActivity(`Updated task "${updatedTask.title}"`);
  } catch (error) {
    console.error(error);
  }
};


const handleDeleteTask = async (taskId) => {
  try {
    await deletePersonalTask(taskId);

    const task = [
      ...tasks.todo,
      ...tasks.progress,
      ...tasks.completed,
    ].find((t) => t._id === taskId);

    if (task) {
      addActivity(`Deleted task "${task.title}"`);
    }

    setTasks((prev) => ({
      todo: prev.todo.filter((t) => t._id !== taskId),
      progress: prev.progress.filter((t) => t._id !== taskId),
      completed: prev.completed.filter((t) => t._id !== taskId),
    }));
  } catch (error) {
    console.error(error);
  }
};

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("myboard_notes");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            title: "Welcome Note",
            content: "Create your first note using the button below.",
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem("myboard_notes", JSON.stringify(notes));
  }, [notes]);

  const stats = {
    total:
      tasks.todo.length + tasks.progress.length + tasks.completed.length,
    active: tasks.progress.length,
    completed: tasks.completed.length,
  };


  const totalTasks =
    tasks.todo.length + tasks.progress.length + tasks.completed.length;
  const completedTasks = tasks.completed.length;
  const completionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const taskDistribution = [
    { label: "To Do", count: tasks.todo.length },
    { label: "In Progress", count: tasks.progress.length },
    { label: "Completed", count: tasks.completed.length },
  ];

  const maxTasks = Math.max(
    tasks.todo.length,
    tasks.progress.length,
    tasks.completed.length,
    1
  );

  const upcomingTasks = [...tasks.todo, ...tasks.progress]
    .filter((task) => task.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const allTasks = [...tasks.todo, ...tasks.progress, ...tasks.completed];

  const getDaysRemaining = (date) => {
    const today = new Date();
    const due = new Date(date);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  };

  const getDeadlineStyle = (date) => {
    const days = getDaysRemaining(date);
    if (days < 0) {
      return { badge: "Overdue", className: "bg-red-100 text-red-700 border-red-200" };
    }
    if (days <= 2) {
      return { badge: `${days} day${days !== 1 ? "s" : ""} left`, className: "bg-orange-100 text-orange-700 border-orange-200" };
    }
    if (days <= 7) {
      return { badge: `${days} days left`, className: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    }
    return { badge: `${days} days left`, className: "bg-green-100 text-green-700 border-green-200" };
  };

  const createNote = () => {
    const newNote = { id: Date.now(), title: "New Note", content: "" };
    setNotes((prev) => [newNote, ...prev]);
  };

  const updateNote = (id, field, value) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, [field]: value } : note))
    );
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All");

  const filterTasks = (taskList) => {
    return taskList.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
      const matchesTag = tagFilter === "All" || task.tag === tagFilter;
      return matchesSearch && matchesPriority && matchesTag;
    });
  };

  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem("myboard_activity");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("myboard_activity", JSON.stringify(activities));
  }, [activities]);

  const addActivity = (text) => {
    setActivities((prev) => [
      { id: Date.now(), text, time: new Date().toLocaleString() },
      ...prev.slice(0, 19),
    ]);
  };

  const [showAllActivities, setShowAllActivities] = useState(false);

  const [showToast, setShowToast] = useState(false);
const [completedTaskName, setCompletedTaskName] = useState("");

{showAllActivities && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b">
        <h2 className="text-xl font-semibold">
          Activity History
        </h2>

        <button
          onClick={() => setShowAllActivities(false)}
          className="text-slate-500 hover:text-slate-700"
        >
          ✕
        </button>
      </div>

      {/* Activity List */}
      <div className="overflow-y-auto max-h-[65vh] p-4 space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="border border-slate-200 rounded-xl p-3"
          >
            <p className="text-sm font-medium">
              {activity.text}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              {activity.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

  return (
    <div className="p-5.75 ">
      {/* Header Card */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border-light p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Board</h1>
            <p className="text-text-secondary text-sm mt-0.5">
              Your private productivity workspace
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl font-medium transition shadow-sm text-sm"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      <CreateTaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreateTask={handleCreateTask}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-surface rounded-xl p-4 shadow-sm border border-border-light flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock3 size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-wide">Total Tasks</p>
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-4 shadow-sm border border-border-light flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
            <AlertCircle size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-wide">Active Tasks</p>
            <p className="text-2xl font-bold text-text-primary">{stats.active}</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-4 shadow-sm border border-border-light flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 size={18} className="text-success" />
          </div>
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-wide">Completed</p>
            <p className="text-2xl font-bold text-text-primary">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Productivity Widgets */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        {/* Upcoming Deadlines */}
        <div className="bg-surface rounded-xl p-4 shadow-sm border border-border-light h-87.5 flex flex-col">
          <h2 className="font-semibold text-text-primary mb-3 text-base">Upcoming Deadlines</h2>
          {upcomingTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-3">📅</div>
              <h3 className="font-medium text-text-primary">No Upcoming Deadlines</h3>
              <p className="text-sm text-text-secondary mt-1">Tasks with due dates will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto flex-1 pr-2">
              {upcomingTasks.map((task) => {
                const status = getDeadlineStyle(task.dueDate);
                return (
                  <div key={task._id} className="border border-border-light rounded-lg p-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-medium text-text-primary text-sm">{task.title}</h3>
                        <p className="text-xs text-text-secondary mt-0.5">Due: {task.dueDate}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-md border ${status.className}`}>
                        {status.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Notes */}
        <div className="bg-surface rounded-xl p-4 shadow-sm border border-border-light h-87.5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-text-primary text-base">Quick Notes</h2>
            <button
              onClick={createNote}
              className="flex items-center gap-1 text-xs bg-primary text-white px-2.5 py-1.5 rounded-lg"
            >
              <Plus size={12} />
              New Note
            </button>
          </div>
          <div className="overflow-y-auto flex-1 pr-2">
            {notes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-5xl mb-3">📝</div>
                <h3 className="font-medium text-text-primary">No Notes Yet</h3>
                <p className="text-sm text-text-secondary mt-1 max-w-xs">
                  Capture ideas, reminders, meeting points, or anything important for later.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="border border-border-light rounded-lg p-2.5">
                    <div className="flex justify-between items-center mb-1">
                      <input
                        value={note.title}
                        onChange={(e) => updateNote(note.id, "title", e.target.value)}
                        className="font-medium text-sm w-full outline-none bg-transparent text-text-primary"
                        placeholder="Title"
                      />
                      <button onClick={() => deleteNote(note.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={note.content}
                      onChange={(e) => updateNote(note.id, "content", e.target.value)}
                      placeholder="Write something..."
                      className="w-full resize-none outline-none text-xs text-text-secondary bg-transparent"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Task Distribution */}
        <div className="bg-surface rounded-xl p-4 shadow-sm border border-border-light h-87.5">
          <h2 className="font-semibold text-text-primary mb-3 text-base">Task Distribution</h2>
          <div className="space-y-4">
            {taskDistribution.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary">{item.label}</span>
                  <span className="text-text-primary">{item.count}</span>
                </div>
                <div className="h-2 bg-border-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(item.count / maxTasks) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deadline Calendar */}
      <div className="max-h-87.5 overflow-y-auto mb-6">
        <DeadlineCalendar tasks={allTasks} />
      </div>

      {/* Personal Kanban */}
      <div>
        <div className="bg-surface rounded-xl p-4 shadow-sm border border-border-light mb-5">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-text-primary text-sm">Productivity Progress</h3>
            <span className="font-bold text-primary text-sm">{completionPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-border-light rounded-full overflow-hidden">
            <div
              className="h-full bg-success transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 shadow-sm border border-border-light mb-8">
          <div className="flex items-center justify-between">
  <h3 className="font-semibold">Recent Activity</h3>

  {activities.length > 10 && (
    <button
      onClick={() => setShowAllActivities(true)}
      className="text-primary text-sm font-medium hover:underline"
    >
      View All →
    </button>
  )}
</div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-5xl mb-3">📊</div>
                <h3 className="font-medium text-text-primary">No Activity Yet</h3>
                <p className="text-sm text-text-secondary mt-1">Task actions will be recorded here.</p>
              </div>
            ) : (
              activities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="border-b border-border-light pb-2 last:border-0">
                  <p className="text-sm text-text-primary">{activity.text}</p>
                  <p className="text-xs text-text-secondary">{activity.time}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-border-light rounded-xl px-4 py-2 text-sm text-text-primary bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-border-light rounded-xl px-4 py-2 text-sm text-text-primary bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option>All</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <h2 className="text-lg font-semibold text-text-primary mb-4">Personal Tasks</h2>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid lg:grid-cols-3 gap-5">
            <BoardColumn
              columnId="todo"
              title="To Do"
              tasks={filterTasks(tasks.todo)}
              onDelete={handleDeleteTask}
              onOpen={(task) => {
                setSelectedTask(task);
                setShowTaskModal(true);
              }}
              titleClass="text-text-primary"
            />
            <BoardColumn
              columnId="progress"
              title="In Progress"
              tasks={filterTasks(tasks.progress)}
              onDelete={handleDeleteTask}
              onOpen={(task) => {
                setSelectedTask(task);
                setShowTaskModal(true);
              }}
              titleClass="text-primary"
            />
            <BoardColumn
              columnId="completed"
              title="Completed"
              tasks={filterTasks(tasks.completed)}
              onDelete={handleDeleteTask}
              onOpen={(task) => {
                setSelectedTask(task);
                setShowTaskModal(true);
              }}
              titleClass="text-success"
            />
          </div>
        </DragDropContext>
      </div>

      {showToast && (
  <div className="fixed top-5 right-5 z-50 animate-bounce">
    <div className="bg-green-500 text-white px-5 py-4 rounded-xl shadow-xl">
      <div className="font-semibold">
        🎉 Task Completed!
      </div>
      <div className="text-sm opacity-90">
        {completedTaskName}
      </div>
    </div>
  </div>
)}

      <TaskDetailsModal
        task={selectedTask}
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleUpdateTask}
      />
    </div>
  );
}