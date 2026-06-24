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
    todo: { id: "todo", title: "To Do", tasks: [] },
    progress: { id: "progress", title: "In Progress", tasks: [] },
    completed: { id: "completed", title: "Completed", tasks: [] },
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
  const [allTasks, setAllTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState("all");

  const currentUserName = user?.name || user?.email?.split("@")[0] || "Guest";

  const filteredTasks = allTasks.filter((task) => {
    if (taskFilter === "all") return true;

    if (taskFilter === "my") {
      return task.assignedTo?.some(
        (member) => member._id.toString() === user.id
      );
    }

    if (taskFilter === "created") {
      return task.createdBy?._id?.toString() === user.id;
    }

    if (taskFilter === "unassigned") {
      return !task.assignedTo?.length;
    }

    return true;
  });

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

  useEffect(() => {
    setBoard({
      columns: {
        todo: {
          id: "todo",
          title: "To Do",
          tasks: filteredTasks.filter((t) => t.status === "todo"),
        },
        progress: {
          id: "progress",
          title: "In Progress",
          tasks: filteredTasks.filter((t) => t.status === "progress"),
        },
        completed: {
          id: "completed",
          title: "Completed",
          tasks: filteredTasks.filter((t) => t.status === "completed"),
        },
      },
    });
  }, [allTasks, taskFilter]);

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
      });

      const savedTask = res.data;
      await fetchTasks();
      socket.emit("taskCreated", savedTask);
      setCreateOpen(false);
    } catch (err) {
      console.error("Error creating task:", err);
      alert(`Task Creation Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const deleteTask = async (task) => {
    try {
      await deleteTaskApi(task._id);
      await fetchTasks();
      setDrawerOpen(false);
      setSelectedTask(null);
      socket.emit("taskDeleted", task);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      await updateTaskApi(selectedTask._id, updatedTask);
      await fetchTasks();
      socket.emit("taskUpdated", { ...selectedTask, ...updatedTask });
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
      await updateTaskStatusApi(movedTask._id, {
        status: destination.droppableId,
      });
      socket.emit("taskMoved", movedTask);
    } catch (err) {
      console.error("Error moving task:", err);
      await fetchTasks();
    }
  };

  const columns = Object.values(board.columns);

  const handleCreateTask = () => {
    setTargetColumn("todo");
    setCreateOpen(true);
  };

  if (loading) {
    return <div className="bg-white rounded-2xl shadow-sm border p-10">Loading board...</div>;
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

      {/* Header Card – only heading and New Task button */}
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

      {/* Filter buttons – separate div, centered */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border-light px-5 py-3 mb-6">
  <div className="flex flex-wrap justify-center gap-2">
    <button
      onClick={() => setTaskFilter("all")}
      className={`px-4 py-2 rounded-xl text-sm font-medium ${
        taskFilter === "all"
          ? "bg-primary text-white"
          : "bg-white border border-border-light"
      }`}
    >
      All Tasks
    </button>

    <button
      onClick={() => setTaskFilter("my")}
      className={`px-4 py-2 rounded-xl text-sm font-medium ${
        taskFilter === "my"
          ? "bg-primary text-white"
          : "bg-white border border-border-light"
      }`}
    >
      My Tasks
    </button>

    <button
      onClick={() => setTaskFilter("created")}
      className={`px-4 py-2 rounded-xl text-sm font-medium ${
        taskFilter === "created"
          ? "bg-primary text-white"
          : "bg-white border border-border-light"
      }`}
    >
      Created By Me
    </button>

    <button
      onClick={() => setTaskFilter("unassigned")}
      className={`px-4 py-2 rounded-xl text-sm font-medium ${
        taskFilter === "unassigned"
          ? "bg-primary text-white"
          : "bg-white border border-border-light"
      }`}
    >
      Unassigned
    </button>
  </div>
</div>

      {/* Kanban Columns */}
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