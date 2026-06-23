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

import {
  getMyNotes,
  createNote as createNoteApi,
  deleteNote as deleteNoteApi,
  updateNote as updateNoteApi,
} from "../api/quickNoteApi";

import {
  getPersonalActivities,
  createPersonalActivity,
} from "../api/personalActivityApi";

const STORAGE_KEY = "myboard_tasks";



export default function MyBoard() {

 const loadTasks = async () => {
  try {
    const data = await getMyTasks();

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
    const data = await createPersonalTask({
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

 const [notes, setNotes] = useState([]);

 useEffect(() => {
  const loadNotes = async () => {
    const data = await getMyNotes();
    setNotes(data);
  };

  loadNotes();
}, []);



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

  const handleCreateNote = async () => {
  try {
    const note = await createNoteApi({
      title: "New Note",
      content: " ",
    });

    setNotes((prev) => [note, ...prev]);
  } catch (error) {
    console.error(error);
  }
};

const handleUpdateNote = async (id, field, value) => {
  const updatedNotes = notes.map((note) =>
    note._id === id
      ? { ...note, [field]: value }
      : note
  );

  setNotes(updatedNotes);

  const updatedNote = updatedNotes.find(
    (note) => note._id === id
  );

  try {
    await updateNoteApi(id, {
      title: updatedNote.title,
      content: updatedNote.content,
    });
  } catch (error) {
    console.error(error);
  }
};

  const handleDeleteNote = async (id) => {
  try {
    await deleteNoteApi(id);

    setNotes((prev) =>
      prev.filter((note) => note._id !== id)
    );
  } catch (error) {
    console.error(error);
  }
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

const [activities, setActivities] = useState([]);

useEffect(() => {
  loadActivities();
}, []);

const loadActivities = async () => {
  try {
    const data = await getPersonalActivities();
    setActivities(data);
  } catch (error) {
    console.error(error);
  }
};

  const addActivity = async (text) => {
  try {
    const activity = await createPersonalActivity({
      action: text,
    });

    setActivities((prev) => [activity, ...prev]);
  } catch (error) {
    console.error(error);
  }
};

const [showToast, setShowToast] = useState(false);
const [completedTaskName, setCompletedTaskName] = useState("");


const getActivityStyle = (action) => {
  const text = action.toLowerCase();

  if (text.includes("created")) {
    return {
      icon: "🟢",
      bg: "bg-green-100",
      text: "text-green-700",
    };
  }

  if (text.includes("updated")) {
    return {
      icon: "🔵",
      bg: "bg-blue-100",
      text: "text-blue-700",
    };
  }

  if (text.includes("deleted")) {
    return {
      icon: "🔴",
      bg: "bg-red-100",
      text: "text-red-700",
    };
  }

  return {
    icon: "⚪",
    bg: "bg-slate-100",
    text: "text-slate-700",
  };
};

const formatActivityTime = (date) => {
  const now = new Date();
  const activity = new Date(date);

  const diff = Math.floor((now - activity) / 1000);

  if (diff < 60) return "Just now";

  if (diff < 3600)
    return `${Math.floor(diff / 60)} min ago`;

  if (diff < 86400)
    return `${Math.floor(diff / 3600)} hr ago`;

  if (diff < 172800) return "Yesterday";

  return activity.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};


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
      <div className="grid grid-cols-3 gap-4 mb-6">
  {/* Total */}
  <div className="group rounded-2xl border border-border-light bg-surface px-5 py-4 transition-all duration-300 hover:border-blue-300 hover:shadow-md">
    <div className="h-1 w-12 rounded-full bg-blue-500 mb-4 transition-all duration-300 group-hover:w-20"></div>

    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-text-primary">
          {stats.total}
        </p>

        <p className="mt-1 text-sm text-text-secondary">
          Total Tasks
        </p>
      </div>

      <Clock3
        size={22}
        className="text-blue-500 opacity-70 group-hover:scale-110 transition-transform"
      />
    </div>
  </div>

  {/* Active */}
  <div className="group rounded-2xl border border-border-light bg-surface px-5 py-4 transition-all duration-300 hover:border-orange-300 hover:shadow-md">
    <div className="h-1 w-12 rounded-full bg-orange-500 mb-4 transition-all duration-300 group-hover:w-20"></div>

    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-text-primary">
          {stats.active}
        </p>

        <p className="mt-1 text-sm text-text-secondary">
          Active Tasks
        </p>
      </div>

      <AlertCircle
        size={22}
        className="text-orange-500 opacity-70 group-hover:scale-110 transition-transform"
      />
    </div>
  </div>

  {/* Completed */}
  <div className="group rounded-2xl border border-border-light bg-surface px-5 py-4 transition-all duration-300 hover:border-green-300 hover:shadow-md">
    <div className="h-1 w-12 rounded-full bg-green-500 mb-4 transition-all duration-300 group-hover:w-20"></div>

    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-text-primary">
          {stats.completed}
        </p>

        <p className="mt-1 text-sm text-text-secondary">
          Completed
        </p>
      </div>

      <CheckCircle2
        size={22}
        className="text-green-500 opacity-70 group-hover:scale-110 transition-transform"
      />
    </div>
  </div>
</div>
      {/* Productivity Widgets */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        {/* Upcoming Deadlines */}
        <div className="bg-surface rounded-2xl border border-border-light shadow-sm p-5 h-[350px] flex flex-col">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold text-text-primary">
      Upcoming Deadlines
    </h2>

    <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
      {upcomingTasks.length} Tasks
    </span>
  </div>

  {upcomingTasks.length === 0 ? (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl mb-4">
        📅
      </div>

      <h3 className="font-semibold text-text-primary">
        No Upcoming Deadlines
      </h3>

      <p className="text-sm text-text-secondary mt-2 max-w-xs leading-relaxed">
        Tasks with due dates will automatically appear here.
      </p>
    </div>
  ) : (
    <div className="space-y-3 overflow-y-auto flex-1 pr-1">
      {upcomingTasks.map((task) => {
        const status = getDeadlineStyle(task.dueDate);

        const priorityColor = {
          Low: "bg-green-500",
          Medium: "bg-yellow-500",
          High: "bg-orange-500",
        };

        return (
          <div
            key={task._id}
            className="group relative overflow-hidden rounded-2xl border border-border-light bg-gradient-to-br from-white to-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
          >
            {/* Priority Accent */}
            <div
              className={`absolute left-0 top-0 h-full w-1 ${
                priorityColor[task.priority] || "bg-primary"
              }`}
            />

            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary text-sm">
                  {task.title}
                </h3>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                    {task.tag || "General"}
                  </span>

                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {task.priority}
                  </span>
                </div>

                <p className="text-xs text-text-secondary mt-3 flex items-center gap-1">
                  📅{" "}
                  {new Date(task.dueDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${status.className}`}
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

        {/* Quick Notes */}
        <div className="bg-surface rounded-xl p-4 shadow-sm border border-border-light h-87.5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-text-primary text-base">Quick Notes</h2>
            <button
             onClick={handleCreateNote}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
            >
              <Plus size={12} />
              New Note
            </button>
          </div>
          <div className="overflow-y-auto flex-1 pr-2">
           {notes.length === 0 ? (
  <div className="h-full flex flex-col items-center justify-center text-center">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl mb-4">
      📝
    </div>
    <h3 className="font-semibold text-text-primary">
      No Notes Yet
    </h3>
    <p className="text-sm text-text-secondary mt-2 max-w-xs leading-relaxed">
      Capture ideas, reminders, meeting notes and anything
      important throughout your day.
    </p>
  </div>
) : (
  <div className="space-y-4">
    {notes.map((note) => (
      <div
        key={note._id}
        className="group relative overflow-hidden rounded-2xl border border-border-light bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
      >
        {/* Accent */}
        <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-l-2xl"></div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <input
            value={note.title}
            onChange={(e) =>
              handleUpdateNote(
                note._id,
                "title",
                e.target.value
              )
            }
            placeholder="Untitled Note"
            className="w-full bg-transparent text-base font-semibold text-text-primary outline-none placeholder:text-slate-400"
          />

          <button
            onClick={() => handleDeleteNote(note._id)}
            className="opacity-0 group-hover:opacity-100 transition text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Content */}
        <textarea
          rows={2}
          value={note.content}
          onChange={(e) =>
            handleUpdateNote(
              note._id,
              "content",
              e.target.value
            )
          }
          placeholder="Write your thoughts..."
          className="w-full resize-none bg-transparent outline-none text-sm text-text-secondary leading-6 placeholder:text-slate-400"
        />

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-border-light flex justify-between items-center">
          <span className="text-xs text-text-secondary">
            Last updated
          </span>

          <span className="text-xs font-medium text-primary">
            {new Date(note.updatedAt).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
              }
            )}
          </span>
        </div>
      </div>
    ))}
  </div>
)}
          </div>
        </div>

        {/* Task Distribution */}
        <div className="bg-surface rounded-2xl border border-border-light shadow-sm p-5 h-[350px] flex flex-col">
  {/* Header */}
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-lg font-semibold text-text-primary">
        Task Distribution
      </h2>
      <p className="text-sm text-text-secondary mt-1">
        Overview of your current workload
      </p>
    </div>

    <div className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
      {stats.total} Total
    </div>
  </div>

  {/* Distribution */}
  <div className="space-y-5 flex-1">
    {taskDistribution.map((item) => {
      const colors = {
        "To Do": {
          dot: "bg-slate-400",
          bar: "bg-slate-400",
          light: "bg-slate-400",
        },
        "In Progress": {
          dot: "bg-blue-500",
          bar: "bg-blue-500",
          light: "bg-blue-100",
        },
        Completed: {
          dot: "bg-green-500",
          bar: "bg-green-500",
          light: "bg-green-100",
        },
      };

      const color = colors[item.label];

      return (
        <div key={item.label}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${color.dot}`}
              />

              <span className="font-medium text-text-primary">
                {item.label}
              </span>
            </div>

            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color.light}`}
            >
              {item.count}
            </span>
          </div>

          <div className="relative h-2 rounded-full bg-border-light overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${color.bar}`}
              style={{
                width: `${maxTasks ? (item.count / maxTasks) * 100 : 0}%`,
              }}
            />
          </div>

          <div className="mt-1 text-right text-xs text-text-secondary">
            {stats.total
              ? Math.round((item.count / stats.total) * 100)
              : 0}
            %
          </div>
        </div>
      );
    })}
  </div>
</div>
      </div>

      {/* Deadline Calendar */}
      <div className="max-h-87.5 overflow-y-auto mb-6">
        <DeadlineCalendar tasks={allTasks} />
      </div>


             {/* Recent Activity */}
      <div className="bg-surface rounded-2xl border border-border-light shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
  <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
</div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-5xl mb-3">📊</div>
                <h3 className="font-medium text-text-primary">No Activity Yet</h3>
                <p className="text-sm text-text-secondary mt-1">Task actions will be recorded here.</p>
              </div>
            ) : (
              activities.slice(0, 10).map((activity, index) => {
  const style = getActivityStyle(activity.action);

  return (
    <div
      key={activity._id}
      className="group relative flex gap-4 rounded-xl p-3 transition-all duration-300 hover:bg-slate-50 hover:shadow-sm"
    >
      {/* Timeline */}
      <div className="relative flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center text-lg`}
        >
          {style.icon}
        </div>

        {index !== activities.length - 1 && (
          <div className="w-0.5 flex-1 bg-border-light mt-2"></div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-5">
        <p className="text-sm font-medium text-text-primary leading-6">
          {activity.action}
        </p>

        <p className="text-xs text-text-secondary mt-1">
          {formatActivityTime(activity.createdAt)}
        </p>
      </div>
    </div>
  );
})
            )}
          </div>
        </div>

        {/* Percentage */}
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

                   {/* Search */}

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

        {/* Personal Kanban */}

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