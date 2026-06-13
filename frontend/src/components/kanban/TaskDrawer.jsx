import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  X,
  CalendarDays,
  GitBranch,
  MessageSquare,
  Paperclip,
  Flag,
} from "lucide-react";

const priorityColors = {
  Critical:
    "bg-red-100 text-red-700",

  High:
    "bg-orange-100 text-orange-700",

  Medium:
    "bg-yellow-100 text-yellow-700",

  Low:
    "bg-emerald-100 text-emerald-700",
};

export default function TaskDrawer({
  task,
  isOpen,
  onClose,
  onDelete,
  onEdit,
}) {
  if (!task) return null;

  const comments =
    Array.isArray(task.comments)
      ? task.comments
      : [];

  const attachments =
    Array.isArray(task.attachments)
      ? task.attachments
      : [];

  const priorityClass =
    priorityColors[
    task.priority
    ] ||
    "bg-slate-100 text-slate-700";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={onClose}
            className="
              fixed
              inset-0
              bg-black/30
              z-40
            "
          />

          {/* Drawer */}
          <motion.div
            initial={{
              x: 500,
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: 500,
            }}
            transition={{
              type: "spring",
              damping: 25,
            }}
            className="
              fixed
              right-0
              top-0
              h-screen
              w-full
              sm:w-[420px]
              bg-white
              shadow-2xl
              z-50
              overflow-y-auto
            "
          >
            {/* Header */}
            <div
              className=" sticky top-0 bg-white border-b border-slate-200 px-6 py-5 flex items-start justify-between z-10
"
            >
              <div>
                <h2
                  className="
                    text-2xl
                    font-bold
                    text-slate-800
                    break-words
                  "
                >
                  {task.title ||
                    "Untitled Task"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {task.status ||
                    "No status"}
                </p>


                <button
                  onClick={onEdit}
                  className="
    mt-4
    w-full
    rounded-xl
    bg-slate-900
    py-3
    text-white
    font-medium
  "
                >
                  Edit Task
                </button>
              </div>



              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDelete(task)}
                  className="
      px-4
      py-2
      rounded-xl
      bg-red-600
      text-white
      hover:bg-grey-700
      transition
    "
                >
                  <X size={22} />
                </button>


              </div>


            </div>

            <div className="p-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">
                  Description
                </h3>

                <p className="text-slate-600 whitespace-pre-wrap">
                  {task.description ||
                    "No description provided"}
                </p>
              </div>

              {/* Details */}
              <div className="mt-8 space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">
                    Priority
                  </span>

                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-sm
                      font-medium
                      ${priorityClass}
                    `}
                  >
                    {task.priority ||
                      "None"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">
                    Assignee
                  </span>

                  <span className="font-medium">
                    {task.assignee ||
                      "Unassigned"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">
                    Due Date
                  </span>

                  <span className="flex items-center gap-2">
                    <CalendarDays size={16} />

                    {task.dueDate ||
                      "Not set"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">
                    GitHub
                  </span>

                  <span className="flex items-center gap-2">
                    <GitBranch size={16} />

                    {task.githubIssue ||
                      "Not linked"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">
                    Status
                  </span>

                  <span className="flex items-center gap-2 capitalize">
                    <Flag size={16} />

                    {task.status ||
                      "Unknown"}
                  </span>
                </div>
              </div>

              {/* Attachments */}
              <div className="mt-10">
                <div className="flex items-center gap-2 mb-4">
                  <Paperclip size={18} />

                  <h3 className="font-semibold">
                    Attachments
                  </h3>
                </div>

                {attachments.length >
                  0 ? (
                  <div className="space-y-2">
                    {attachments.map(
                      (
                        file,
                        index
                      ) => (
                        <div
                          key={index}
                          className="
                            p-3
                            rounded-xl
                            border
                            border-slate-200
                          "
                        >
                          {file}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div
                    className="
                      p-4
                      rounded-xl
                      bg-slate-50
                      text-slate-500
                    "
                  >
                    No attachments
                  </div>
                )}
              </div>

              {/* Comments */}
              <div className="mt-10">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare size={18} />

                  <h3 className="font-semibold">
                    Comments
                  </h3>
                </div>

                {comments.length >
                  0 ? (
                  <div className="space-y-3">
                    {comments.map(
                      (
                        comment,
                        index
                      ) => (
                        <div
                          key={index}
                          className="
                            p-4
                            rounded-xl
                            bg-slate-50
                          "
                        >
                          {comment}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div
                    className="
                      p-4
                      rounded-xl
                      bg-slate-50
                      text-slate-500
                    "
                  >
                    No comments yet
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}