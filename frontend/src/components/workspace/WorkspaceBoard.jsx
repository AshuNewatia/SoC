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

useEffect(() => {
  if (!workspaceId) return;

  // 1. Tell socket to join this workspace room
  socket.emit("userJoined", {
    id: socket.id,
    name: currentUserName,
    workspaceId,
    userId: user.id,
  });

  // 2. Real-time Task Created handler (Appends directly to state)
  const handleTaskCreatedSocket = (newTask) => {
    // Only process if task belongs to the current open workspace
    if (newTask.workspace === workspaceId || newTask.workspace?._id === workspaceId) {
      setAllTasks((prevTasks) => {
        // Prevent duplicate cards
        if (prevTasks.some((t) => t._id === newTask._id)) return prevTasks;
        return [newTask, ...prevTasks];
      });
    }
  };

  // 3. Real-time Task Updated handler
  const handleTaskUpdatedSocket = (updatedTask) => {
    setAllTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === updatedTask._id ? { ...t, ...updatedTask } : t))
    );
  };

  // 4. Real-time Task Deleted handler
  const handleTaskDeletedSocket = (deletedTask) => {
    setAllTasks((prevTasks) =>
      prevTasks.filter((t) => t._id !== (deletedTask._id || deletedTask))
    );
  };

  socket.on("taskCreated", handleTaskCreatedSocket);
  socket.on("taskUpdated", handleTaskUpdatedSocket);
  socket.on("taskMoved", fetchTasks);
  socket.on("taskDeleted", handleTaskDeletedSocket);

  fetchTasks();
  fetchMembers();

  const handleGlobalCreate = () => setCreateOpen(true);
  window.addEventListener("openCreateTaskModal", handleGlobalCreate);

  return () => {
    socket.off("taskCreated", handleTaskCreatedSocket);
    socket.off("taskUpdated", handleTaskUpdatedSocket);
    socket.off("taskMoved", fetchTasks);
    socket.off("taskDeleted", handleTaskDeletedSocket);
    window.removeEventListener("openCreateTaskModal", handleGlobalCreate);
  };
}, [workspaceId, currentUserName, user.id]);

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
      await fetchTasks();
    }
  };

  const columns = Object.values(board.columns);
  const handleCreateTask = () => {
    setTargetColumn("todo");
    setCreateOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-white via-slate-50 to-primary/5 rounded-2xl border border-border-light shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <Skeleton className="h-8 w-64 rounded-lg" />
              <Skeleton className="h-4 w-80 rounded" />
            </div>
            <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border-light shadow-sm p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <Skeleton className="h-11 w-full lg:w-120 rounded-xl" />
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Skeleton className="h-10 w-24 rounded-xl shrink-0" />
              <Skeleton className="h-10 w-24 rounded-xl shrink-0" />
              <Skeleton className="h-10 w-32 rounded-xl shrink-0" />
              <Skeleton className="h-10 w-28 rounded-xl shrink-0" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex lg:grid lg:grid-cols-3 gap-6 min-w-[960px] lg:min-w-0">
            {[1, 2, 3].map((column) => (
              <div key={column} className="w-[320px] lg:w-auto">
                <div className="bg-surface rounded-2xl border border-border-light shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-5 w-28 rounded" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <div className="p-4 space-y-4">
                    {[1, 2, 3].map((card) => (
                      <div key={card} className="bg-white rounded-2xl border border-slate-200 p-4">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <TaskDrawer
        task={selectedTask}
        members={members}
        fetchTasks={fetchTasks}
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

      <div className="bg-white to-primary/5 rounded-2xl shadow-sm border border-border-light p-5 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Workspace Board</h1>
            <p className="text-text-secondary text-sm mt-0.5">
              Organize work with drag-and-drop Kanban boards.
            </p>
          </div>
          <button
            onClick={handleCreateTask}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-lg active:scale-95 text-sm"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-border-light px-5 py-4 mb-6 sticky top-[72px] z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative w-full lg:max-w-lg">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-border-light bg-white text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary hover:border-primary/30 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setTaskFilter("all")}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                taskFilter === "all" 
                  ? "bg-primary text-white shadow-sm" 
                  : "bg-white border border-border-light hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-sm"
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setTaskFilter("my")}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                taskFilter === "my" 
                  ? "bg-primary text-white shadow-sm" 
                  : "bg-white border border-border-light hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-sm"
              }`}
            >
              My Tasks
            </button>
            <button
              onClick={() => setTaskFilter("created")}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                taskFilter === "created" 
                  ? "bg-primary text-white shadow-sm" 
                  : "bg-white border border-border-light hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-sm"
              }`}
            >
              Created By Me
            </button>
            <button
              onClick={() => setTaskFilter("unassigned")}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                taskFilter === "unassigned" 
                  ? "bg-primary text-white shadow-sm" 
                  : "bg-white border border-border-light hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-sm"
              }`}
            >
              Unassigned
            </button>
          </div>
        </div>
      </div>

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