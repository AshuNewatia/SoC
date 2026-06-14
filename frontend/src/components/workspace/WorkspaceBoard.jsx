// src/pages/KanbanBoard.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import axios from "axios";
import { DragDropContext } from "@hello-pangea/dnd";
import socket from "../../hooks/useSocket";
import { useAuth } from "../../context/authContext";
import Column from "../kanban/Column";
import TaskDrawer from "../kanban/TaskDrawer";
import CreateTaskModal from "../kanban/CreateTaskModal";
import EditTaskModal from "../kanban/EditTaskModal";
import { boardData as initialBoard } from "../../data/mockBoard";

const API_URL = import.meta.env.VITE_API_URL;

export default function KanbanBoard() {
  const { id: workspaceId } = useParams();
  const { user } = useAuth();
  const [board, setBoard] = useState(initialBoard);
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState("todo");

  const currentUserName = user?.name || user?.email?.split("@")[0] || "Guest";

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/workspaces/${workspaceId}/tasks`);
      const tasks = res.data;
      setBoard({
        ...initialBoard,
        columns: {
          todo: {
            ...initialBoard.columns.todo,
            tasks: tasks.filter((t) => t.status === "todo"),
          },
          progress: {
            ...initialBoard.columns.progress,
            tasks: tasks.filter((t) => t.status === "progress"),
          },
          completed: {
            ...initialBoard.columns.completed,
            tasks: tasks.filter((t) => t.status === "completed"),
          },
        },
      });
    } catch (err) {
      console.error("Error fetching tasks:", err);
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
      const res = await axios.post(`${API_URL}/api/workspaces/${workspaceId}/tasks`, {
        ...task,
        status: targetColumn,
      });
      const savedTask = res.data;
      setBoard((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [savedTask.status]: {
            ...prev.columns[savedTask.status],
            tasks: [savedTask, ...prev.columns[savedTask.status].tasks],
          },
        },
      }));
      socket.emit("taskCreated", savedTask);
      setCreateOpen(false);
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const deleteTask = async (task) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${task._id}`);
      fetchTasks();
      setDrawerOpen(false);
      setSelectedTask(null);
      socket.emit("taskDeleted", task);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      await axios.put(`${API_URL}/api/tasks/${updatedTask._id}`, updatedTask);
      fetchTasks();
      socket.emit("taskUpdated", updatedTask);
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

    try {
      await axios.patch(`${API_URL}/api/tasks/${movedTask._id}/status`, {
        status: destination.droppableId,
      });
      socket.emit("taskMoved", movedTask);
    } catch (err) {
      console.error("Error moving task:", err);
      fetchTasks();
    }
  };

  const columns = Object.values(board.columns);

  const handleCreateTask = () => {
    setTargetColumn("todo");
    setCreateOpen(true);
  };

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

      {/* Header Card – same width as columns container */}
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

      {/* Kanban Columns – full width alignment */}
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