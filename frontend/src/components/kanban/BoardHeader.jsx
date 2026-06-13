import {
  Plus,
  Activity,
  CheckCircle2,
  Users,
  Clock3,
} from "lucide-react";

export default function BoardHeader({
  onlineUsers,
  totalTasks,
  completedTasks,
  onCreateTask,
}) {
  const progress =
    totalTasks > 0
      ? Math.round(
          (completedTasks / totalTasks) * 100
        )
      : 0;

  return (
    <div
      className="
        mb-8
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1
              className="
                text-3xl
                font-bold
                text-slate-900
              "
            >
              SyncBoard
            </h1>

            <p
              className="
                mt-2
                text-slate-500
              "
            >
              Track progress, manage
              tasks, and collaborate
              efficiently.
            </p>
          </div>

          <button
            onClick={() => onCreateTask("todo")}
            className="
              flex
              items-center
              gap-2
              px-6
              py-3
              rounded-2xl
              bg-sky-500
              text-white
              font-medium
              hover:bg-sky-600
              transition
              shadow-md
            "
          >
            <Plus size={18} />
            Create Task
          </button>
        </div>

        {/* Progress */}
        <div className="mt-8">
          <div className="flex justify-between mb-2">
            <span
              className="
                text-sm
                font-medium
                text-slate-600
              "
            >
              Sprint Progress
            </span>

            <span
              className="
                text-sm
                font-semibold
                text-slate-800
              "
            >
              {progress}%
            </span>
          </div>

          <div
            className="
              h-3
              rounded-full
              bg-slate-100
              overflow-hidden
            "
          >
            <div
              className="
                h-full
                rounded-full
                bg-sky-500
                transition-all
                duration-500
              "
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4
            gap-4
            mt-8
          "
        >
          <div
            className="
              rounded-2xl
              border
              border-slate-200
              p-5
            "
          >
            <div className="flex items-center gap-3">
              <Activity
                className="text-sky-500"
                size={20}
              />

              <span className="text-slate-600">
                Active Tasks
              </span>
            </div>

            <p
              className="
                text-3xl
                font-bold
                mt-3
              "
            >
              {totalTasks}
            </p>
          </div>

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              p-5
            "
          >
            <div className="flex items-center gap-3">
              <CheckCircle2
                className="text-emerald-500"
                size={20}
              />

              <span className="text-slate-600">
                Completed
              </span>
            </div>

            <p
              className="
                text-3xl
                font-bold
                mt-3
              "
            >
              {completedTasks}
            </p>
          </div>

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              p-5
            "
          >
            <div className="flex items-center gap-3">
              <Users
                className="text-indigo-500"
                size={20}
              />

              <span className="text-slate-600">
                Members
              </span>
            </div>

            <p
              className="
                text-3xl
                font-bold
                mt-3
              "
            >
              {onlineUsers.length}
            </p>
          </div>

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              p-5
            "
          >
            <div className="flex items-center gap-3">
              <Clock3
                className="text-violet-500"
                size={20}
              />

              <span className="text-slate-600">
                Pending
              </span>
            </div>

            <p
              className="
                text-3xl
                font-bold
                mt-3
              "
            >
              {totalTasks - completedTasks}
            </p>
          </div>
        </div>

        {/* Online Users */}
        <div className="mt-8">
          <h3
            className="
              text-sm
              font-semibold
              text-slate-700
              mb-3
            "
          >
            Active Collaborators
          </h3>

          <div className="flex -space-x-3">
            {onlineUsers.map(
              (user, index) => (
                <div
                  key={index}
                  className="
                    h-11
                    w-11
                    rounded-full
                    border-4
                    border-white
                    bg-sky-500
                    text-white
                    flex
                    items-center
                    justify-center
                    font-semibold
                    shadow
                  "
                >
                  {user.name?.[0]}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}