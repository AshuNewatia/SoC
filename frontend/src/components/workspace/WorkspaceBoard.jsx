import api from "../../services/api";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { Search, X } from "lucide-react";
import { DragDropContext } from "@hello-pangea/dnd";
import socket from "../../hooks/useSocket";
import { useAuth } from "../../context/authContext";
import Column from "../kanban/Column";
import TaskDrawer from "../kanban/TaskDrawer";
import CreateTaskModal from "../kanban/CreateTaskModal";
import EditTaskModal from "../kanban/EditTaskModal";
import { handleApiError, handleSuccess } from "../../utils/handleApiError";
import Skeleton from "../common/Skeleton";

import {
  getTasks,
  createTask as createTaskApi,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
  updateTaskStatus as updateTaskStatusApi,
} from "../../services/taskServices";

const emptyBoard = {
  columns: {
    todo: { id: "todo", title: "To Do", tasks: [] },
    progress: { id: "progress", title: "In Progress", tasks: [] },
    completed: { id: "completed", title: "Completed", tasks: [] },
  },
};

export default function KanbanBoard() {
  const { id: workspaceId } = useParams();
  const { user } = useAuth();

  // State
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState("todo");
  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState("all");
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [board, setBoard] = useState(emptyBoard);

  const currentUserName = user?.name || user?.email?.split("@")[0] || "Guest";

  // Memoized filtered tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      let passesFilter = true;

      if (taskFilter === "my") {
        passesFilter = task.assignedTo?.some(
          (member) => member._id.toString() === user.id
        );
      }

      if (taskFilter === "created") {
        passesFilter = task.createdBy?._id?.toString() === user.id;
      }

      if (taskFilter === "unassigned") {
        passesFilter = !task.assignedTo?.length;
      }

      const search = searchQuery.toLowerCase();
      const matchesSearch =
        task.title?.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search);

      return passesFilter && matchesSearch;
    });
  }, [allTasks, taskFilter, searchQuery, user.id]);

  // Rebuild board whenever filteredTasks changes
  useEffect(() => {
    setBoard({
      columns: {
        todo: {
          id: "todo",
          title: "To Do",
          tasks: filteredTasks.filter((task) => task.status === "todo"),
        },
        progress: {
          id: "progress",
          title: "In Progress",
          tasks: filteredTasks.filter((task) => task.status === "progress"),
        },
        completed: {
          id: "completed",
          title: "Completed",
          tasks: filteredTasks.filter((task) => task.status === "completed"),
        },
      },
    });
  }, [filteredTasks]);

  const fetchTasks = async () => {
    try {
      const res = await getTasks(workspaceId);
      const tasks = res.data;
      setAllTasks(tasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/api/workspaces/${workspaceId}/members`);
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch workspace members:", error);
    }
  };

  // Socket listeners
  useEffect(() => {
    if (!workspaceId) return;

    socket.on("connect", () => {
      socket.emit("userJoined", {
        id: socket.id,
        name: currentUserName,
        workspaceId,
        userId: user.id,
      });
    });

    socket.on("taskMoved", fetchTasks);
    socket.on("taskCreated", fetchTasks);
    socket.on("taskUpdated", fetchTasks);
    socket.on("taskDeleted", fetchTasks);

    fetchTasks();
    fetchMembers();

    const handleGlobalCreate = () => setCreateOpen(true);
    window.addEventListener("openCreateTaskModal", handleGlobalCreate);

    return () => {
      socket.off("connect");
      socket.off("taskMoved");
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
      window.removeEventListener("openCreateTaskModal", handleGlobalCreate);
    };
  }, [workspaceId, currentUserName, user.id]);

  // Comment sync
  useEffect(() => {
    const syncTaskCommentCount = () => {
      fetchTasks();
    };

    socket.on("commentCreated", syncTaskCommentCount);
    socket.on("commentDeleted", syncTaskCommentCount);

    return () => {
      socket.off("commentCreated", syncTaskCommentCount);
      socket.off("commentDeleted", syncTaskCommentCount);
    };
  }, [workspaceId]);

  // CRUD operations
  const createTask = async (task) => {
    try {
      const res = await createTaskApi(workspaceId, {
        ...task,
        status: targetColumn,
      });

      const savedTask = res.data;
      await fetchTasks();
      socket.emit("taskCreated", savedTask);
      handleSuccess("Task created successfully");
      setCreateOpen(false);
    } catch (err) {
      console.error("Error creating task:", err);
      handleApiError(err);
    }
  };

  const deleteTask = async (task) => {
    try {
      await deleteTaskApi(task._id);
      await fetchTasks();
      setDrawerOpen(false);
      setSelectedTask(null);
      socket.emit("taskDeleted", task);
      handleSuccess("Task deleted successfully");
    } catch (err) {
      console.error("Error deleting task:", err);
      handleApiError(err);
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      await updateTaskApi(selectedTask._id, updatedTask);
      await fetchTasks();
      socket.emit("taskUpdated", { ...selectedTask, ...updatedTask });
      handleSuccess("Task updated successfully");
      setEditOpen(false);
    } catch (err) {
      console.error("Error updating task:", err);
      handleApiError(err);
    }
  };

  // Drag & Drop
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColumn = board.columns[source.droppableId];
    const destColumn = board.columns[destination.droppableId];
    const sourceTasks = [...sourceColumn.tasks];
    const [movedTask] = sourceTasks.splice(source.index, 1);

    let updatedBoard;
    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, movedTask);
      updatedBoard = {
        ...board,
        columns: {
          ...board.columns,
          [source.droppableId]: { ...sourceColumn, tasks: sourceTasks },
        },
      };
    } else {
      const destTasks = [...destColumn.tasks];
      destTasks.splice(destination.index, 0, { ...movedTask, status: destination.droppableId });
      updatedBoard = {
        ...board,
        columns: {
          ...board.columns,
          [source.droppableId]: { ...sourceColumn, tasks: sourceTasks },
          [destination.droppableId]: { ...destColumn, tasks: destTasks },
        },
      };
    }

    // Optimistic UI update on board
    setBoard(updatedBoard);

    try {
      await updateTaskStatusApi(movedTask._id, {
        status: destination.droppableId,
      });
      socket.emit("taskMoved", {
        ...movedTask,
        status: destination.droppableId,
        workspace: workspaceId,
      });
    } catch (err) {
      console.error("Error moving task:", err);
      handleApiError(err);
      // Rollback: fetch latest tasks
      await fetchTasks();
    }
  };

  const columns = Object.values(board.columns);
  const handleCreateTask = () => {
    setTargetColumn("todo");
    setCreateOpen(true);
  };

  // Loading state – using Skeleton component
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-surface rounded-2xl border border-border-light shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <Skeleton className="h-8 w-64 rounded-lg" />
              <Skeleton className="h-4 w-80 rounded" />
            </div>
            <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-surface rounded-2xl border border-border-light shadow-sm p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <Skeleton className="h-11 w-full lg:w-[480px] rounded-xl" />
            <div className="flex gap-2 flex-wrap">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((column) => (
            <div
              key={column}
              className="bg-surface rounded-2xl border border-border-light shadow-sm overflow-hidden"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-5 w-28 rounded" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>

              {/* Cards */}
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((card) => (
                  <div
                    key={card}
                    className="bg-white rounded-2xl border border-slate-200 p-4"
                  >
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <Skeleton className="mt-3 h-4 w-full rounded" />
                    <Skeleton className="mt-2 h-4 w-2/3 rounded" />
                    <div className="flex justify-between items-center mt-5">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-4 w-20 rounded" />
                    </div>
                    <div className="flex justify-between items-center mt-5">
                      <Skeleton className="h-4 w-24 rounded" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <TaskDrawer
        task={selectedTask}
        members={members}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onDelete={deleteTask}
        onEdit={() => {
          setEditOpen(true);
          setDrawerOpen(false);
        }}
      />
      <CreateTaskModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={createTask}
      />
      <EditTaskModal
        task={selectedTask}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleEditTask}
      />

      {/* Header */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border-light p-5 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Workspace Board</h1>
            <p className="text-text-secondary text-sm mt-0.5">
              Track progress, manage tasks, and collaborate efficiently.
            </p>
          </div>
          <button
            onClick={handleCreateTask}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl font-medium transition shadow-sm text-sm"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border-light px-5 py-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative w-full lg:max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-border-light bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTaskFilter("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                taskFilter === "all" ? "bg-primary text-white" : "bg-white border border-border-light hover:bg-slate-50"
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setTaskFilter("my")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                taskFilter === "my" ? "bg-primary text-white" : "bg-white border border-border-light hover:bg-slate-50"
              }`}
            >
              My Tasks
            </button>
            <button
              onClick={() => setTaskFilter("created")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                taskFilter === "created" ? "bg-primary text-white" : "bg-white border border-border-light hover:bg-slate-50"
              }`}
            >
              Created By Me
            </button>
            <button
              onClick={() => setTaskFilter("unassigned")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                taskFilter === "unassigned" ? "bg-primary text-white" : "bg-white border border-border-light hover:bg-slate-50"
              }`}
            >
              Unassigned
            </button>
          </div>
        </div>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((column) => (
              <div key={column.id} className="w-full">
                <Column
                  column={column}
                  onCreateTask={handleCreateTask}
                  onTaskClick={(task) => {
                    setSelectedTask(task);
                    setDrawerOpen(true);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>
    </>
  );
}