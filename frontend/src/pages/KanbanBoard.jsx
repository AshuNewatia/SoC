import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  DragDropContext,
} from "@hello-pangea/dnd";

import socket from "../hooks/useSocket";

import BoardHeader from "../components/kanban/BoardHeader";
import Column from "../components/kanban/Column";
import TaskDrawer from "../components/kanban/TaskDrawer";
import CreateTaskModal from "../components/kanban/CreateTaskModal";
import EditTaskModal from "../components/kanban/EditTaskModal";

import {
  boardData as initialBoard,
} from "../data/mockBoard";

export default function KanbanBoard() {
  const [board, setBoard] =
    useState(initialBoard);

  const [onlineUsers, setOnlineUsers] =
    useState(
      initialBoard.onlineUsers || []
    );

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [targetColumn, setTargetColumn] =
    useState("todo");

  const [currentUser] = useState(
    () => ({
      name: `User-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`,
    })
  );

  /* ---------------- Fetch Tasks ---------------- */

  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/tasks"
      );

      const tasks = res.data;

      setBoard({
        ...initialBoard,

        columns: {
          todo: {
            ...initialBoard.columns.todo,

            tasks: tasks.filter(
              (task) =>
                task.status ===
                "todo"
            ),
          },

          progress: {
            ...initialBoard.columns
              .progress,

            tasks: tasks.filter(
              (task) =>
                task.status ===
                "progress"
            ),
          },

          review: {
            ...initialBoard.columns
              .review,

            tasks: tasks.filter(
              (task) =>
                task.status ===
                "review"
            ),
          },

          done: {
            ...initialBoard.columns
              .done,

            tasks: tasks.filter(
              (task) =>
                task.status ===
                "done"
            ),
          },
        },
      });
    } catch (err) {
      console.error(
        "Error fetching tasks:",
        err
      );
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  /* ---------------- Socket Events ---------------- */

  useEffect(() => {
    socket.on(
      "connect",
      () => {
        socket.emit(
          "userJoined",
          {
            id: socket.id,
            name:
              currentUser.name,
          }
        );
      }
    );

    socket.on(
      "onlineUsers",
      (users) => {
        setOnlineUsers(users);
      }
    );


    socket.on(
      "taskMoved",
      fetchTasks
    );

    socket.on(
      "taskCreated",
      fetchTasks
    );

    socket.on(
      "taskUpdated",
      fetchTasks
    );

    return () => {
      socket.off("connect");

      socket.off(
        "onlineUsers"
      );

      socket.off(
        "taskMoved"
      );

      socket.off(
        "taskCreated"
      );

      socket.off(
        "taskUpdated"
      );
    };
  }, [currentUser.name]);

  /* ---------------- Statistics ---------------- */

  const columns =
    Object.values(
      board.columns
    );

  const totalTasks =
    useMemo(() => {
      return columns.reduce(
        (
          total,
          column
        ) =>
          total +
          column.tasks.length,
        0
      );
    }, [columns]);

  const completedTasks =
    board.columns.done.tasks
      .length;

  /* ---------------- Create Task ---------------- */

const handleCreateTask = (
  columnId = "todo"
) => {
  if (
    typeof columnId !== "string"
  ) {
    columnId = "todo";
  }

  setTargetColumn(columnId);

  setCreateOpen(true);
};



/* ---------------- Create Task ---------------- */

const createTask = async (task) => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/tasks",
      {
        ...task,
        status: targetColumn,
      }
    );

    const savedTask = res.data;

    const updatedBoard = {
      ...board,

      columns: {
        ...board.columns,

        [savedTask.status]: {
          ...board.columns[
            savedTask.status
          ],

          tasks: [
            savedTask,
            ...board.columns[
              savedTask.status
            ].tasks,
          ],
        },
      },
    };

    setBoard(updatedBoard);

    socket.emit(
      "taskCreated",
      savedTask
    );

    setCreateOpen(false);
  } catch (err) {
    console.error(
      "Error creating task:",
      err
    );
  }
};

/* ---------------- Delete Task ---------------- */

const deleteTask = async (task) => {
  try {
    await axios.delete(
      `http://localhost:5000/api/tasks/${task._id}`
    );

    fetchTasks();

    setDrawerOpen(false);

    setSelectedTask(null);

    socket.emit(
      "taskDeleted",
      task
    );
  } catch (err) {
    console.error(
      "Error deleting task:",
      err
    );
  }
};

/* ---------------- Edit Task ---------------- */

const handleEditTask = async (
  updatedTask
) => {
  try {
    await axios.put(
      `http://localhost:5000/api/tasks/${updatedTask._id}`,
      updatedTask
    );

    fetchTasks();

    socket.emit(
      "taskUpdated",
      updatedTask
    );
  } catch (err) {
    console.error(
      "Error updating task:",
      err
    );
  }
};

/* ---------------- Drag & Drop ---------------- */

const onDragEnd = async (result) => {
  const { source, destination } = result;

  if (!destination) return;

  if (
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  ) {
    return;
  }

  const sourceColumn =
    board.columns[source.droppableId];

  const destinationColumn =
    board.columns[destination.droppableId];

  const sourceTasks = [
    ...sourceColumn.tasks,
  ];

  const [movedTask] =
    sourceTasks.splice(source.index, 1);

  let updatedBoard;

  if (
    source.droppableId ===
    destination.droppableId
  ) {
    sourceTasks.splice(
      destination.index,
      0,
      movedTask
    );

    updatedBoard = {
      ...board,

      columns: {
        ...board.columns,

        [source.droppableId]: {
          ...sourceColumn,

          tasks: sourceTasks,
        },
      },
    };
  } else {
    const destinationTasks = [
      ...destinationColumn.tasks,
    ];

    destinationTasks.splice(
      destination.index,
      0,
      {
        ...movedTask,

        status:
          destination.droppableId,
      }
    );

    updatedBoard = {
      ...board,

      columns: {
        ...board.columns,

        [source.droppableId]: {
          ...sourceColumn,

          tasks: sourceTasks,
        },

        [destination.droppableId]:
          {
            ...destinationColumn,

            tasks:
              destinationTasks,
          },
      },
    };
  }

  /* Update UI instantly */

  setBoard(updatedBoard);

  /* Update database */

  try {
    await axios.put(
      `http://localhost:5000/api/tasks/${movedTask._id}`,
      {
        ...movedTask,

        status:
          destination.droppableId,
      }
    );

    socket.emit(
      "taskMoved",
      movedTask
    );
  } catch (err) {
    console.error(
      "Error moving task:",
      err
    );

    fetchTasks();
  }
};




  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6">
        <BoardHeader
          onlineUsers={
            onlineUsers
          }
          totalTasks={
            totalTasks
          }
          completedTasks={
            completedTasks
          }
          onCreateTask={
            handleCreateTask
          }
        />

<TaskDrawer
  task={selectedTask}
  isOpen={drawerOpen}
  onClose={() =>
    setDrawerOpen(false)
  }
  onDelete={deleteTask}
/>

        <CreateTaskModal
          isOpen={
            createOpen
          }
          onClose={() =>
            setCreateOpen(
              false
            )
          }
          onCreate={
            createTask
          }
        />

        <EditTaskModal
          task={
            selectedTask
          }
          isOpen={
            editOpen
          }
          onClose={() =>
            setEditOpen(
              false
            )
          }
          onSave={
            handleEditTask
          }
        />

        <DragDropContext
          onDragEnd={
            onDragEnd
          }
        >
          <div
            className="
              flex
              flex-col
              xl:flex-row
              gap-6
            "
          >
            <div
              className="
                flex-1
                overflow-x-auto
              "
            >
              <div
                className="
                  flex
                  gap-6
                  pb-6
                  min-w-max
                "
              >
                {columns.map(
                  (
                    column
                  ) => (
                    <Column
                      key={
                        column.id
                      }
                      column={
                        column
                      }
                      onCreateTask={
                        handleCreateTask
                      }
                      onTaskClick={(
                        task
                      ) => {
                        setSelectedTask(
                          task
                        );

                        setDrawerOpen(
                          true
                        );
                      }}
                    />
                  )
                )}
              </div>
            </div>

          
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}