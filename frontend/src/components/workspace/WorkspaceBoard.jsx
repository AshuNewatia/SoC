// src/pages/KanbanBoard.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { DragDropContext } from "@hello-pangea/dnd";
import socket from "../../hooks/useSocket";
import { useAuth } from "../../context/authContext";
import Column from "../kanban/Column";
import TaskDrawer from "../kanban/TaskDrawer";
import CreateTaskModal from "../kanban/CreateTaskModal";
import EditTaskModal from "../kanban/EditTaskModal";


import {
  getTasks,
  createTask as createTaskApi,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
  updateTaskStatus as updateTaskStatusApi,
} from "../../services/taskServices";

const emptyBoard = {
  columns: {
    todo: {
      id: "todo",
      title: "To Do",
      tasks: [],
    },
    progress: {
      id: "progress",
      title: "In Progress",
      tasks: [],
    },
    completed: {
      id: "completed",
      title: "Completed",
      tasks: [],
    },
  },
};

export default function KanbanBoard() {
  const { id: workspaceId } = useParams();
  const { user } = useAuth();
  const [board, setBoard] = useState(emptyBoard);
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState("todo");
  const [loading, setLoading] = useState(true);

  const currentUserName = user?.name || user?.email?.split("@")[0] || "Guest";

  const fetchTasks = async () => {
    try {
      const res = await getTasks(workspaceId);
      const tasks = res.data;

      setBoard({
        columns: {
          todo: {
            id: "todo",
            title: "To Do",
            tasks: tasks.filter((t) => t.status === "todo"),
          },
          progress: {
            id: "progress",
            title: "In Progress",
            tasks: tasks.filter((t) => t.status === "progress"),
          },
          completed: {
            id: "completed",
            title: "Completed",
            tasks: tasks.filter((t) => t.status === "completed"),
          },
        },
      });
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!workspaceId) return;

    socket.on("connect", () => {
      socket.emit("userJoined", { id: socket.id, name: currentUserName, workspaceId });
    });

    socket.on("taskMoved", fetchTasks);
    socket.on("taskCreated", fetchTasks);
    socket.on("taskUpdated", fetchTasks);
    socket.on("taskDeleted", fetchTasks);

    fetchTasks();

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
  }, [workspaceId, currentUserName]);


  const createTask = async (task) => {
    try {
      const res = await createTaskApi(workspaceId, {
        ...task,
        status: targetColumn,
        createdBy: user.id,
        assignedTo: [],
      });
      const savedTask = res.data;
      await fetchTasks();               // ✅ await refresh
      socket.emit("taskCreated", savedTask);
      setCreateOpen(false);
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const deleteTask = async (task) => {
    try {
      await deleteTaskApi(task._id);
      await fetchTasks();               // ✅ await refresh
      setDrawerOpen(false);
      setSelectedTask(null);
      socket.emit("taskDeleted", task);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // ✅ Bug #1 fixed: use selectedTask._id instead of task._id
  const handleEditTask = async (updatedTask) => {
    try {
      await updateTaskApi(selectedTask._id, updatedTask);
      await fetchTasks();                // ✅ await refresh
      socket.emit("taskUpdated", {
        ...selectedTask,
        ...updatedTask,
      });
      setEditOpen(false);
    } catch (err) {
      console.error("Error updating task:", err);
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

    // ✅ Bug #2 fixed: use movedTask._id instead of task._id
    try {
      await updateTaskStatusApi(movedTask._id, {
        status: destination.droppableId,
      });
      socket.emit("taskMoved", movedTask);
    } catch (err) {
      console.error("Error moving task:", err);
      await fetchTasks();   // rollback on error
    }
  };

  const columns = Object.values(board.columns);

  const handleCreateTask = () => {
    setTargetColumn("todo");
    setCreateOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-10">
        Loading board...
      </div>
    );
  }

  return (
    <>
      <TaskDrawer
        task={selectedTask}
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

      {/* Header Card */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border-light p-5 mb-6">
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

      {/* Kanban Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="overflow-x-auto">
          <div className="flex justify-between gap-6 min-w-max px-1">
            {columns.map((column) => (
              <div key={column.id} className="w-90 shrink-0">
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