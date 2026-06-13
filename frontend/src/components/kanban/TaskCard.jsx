import { motion } from "framer-motion";
import {
  CalendarDays,
  MessageSquare,
  Paperclip,
  GitBranch,
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

export default function TaskCard({
  task,
  onClick,
}) {
  const priorityStyle =
    priorityColors[task.priority] ||
    "bg-slate-100 text-slate-700";

  const assigneeInitial =
    task.assignee?.charAt(0)?.toUpperCase() ||
    "U";

  const commentsCount =
    Array.isArray(task.comments)
      ? task.comments.length
      : task.comments || 0;

  const attachmentsCount =
    Array.isArray(task.attachments)
      ? task.attachments.length
      : task.attachments || 0;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{
        y: -2,
      }}
      transition={{
        duration: 0.15,
      }}
      className="
        bg-white
        border
        border-slate-200
        rounded-xl
        p-4
        shadow-sm
        hover:shadow-md
        transition
        cursor-pointer
      "
    >
      {/* Title */}
      <div className="mb-3">
        <h3
          className="
            font-semibold
            text-slate-800
            leading-snug
          "
        >
          {task.title ||
            "Untitled Task"}
        </h3>

        <p
          className="
            text-sm
            text-slate-500
            mt-1
            line-clamp-2
          "
        >
          {task.description ||
            "No description provided"}
        </p>
      </div>

      {/* Priority + GitHub */}
      <div
        className="
          flex
          items-center
          justify-between
          mb-4
        "
      >
        <span
          className={`
            px-2.5
            py-1
            rounded-full
            text-xs
            font-medium
            ${priorityStyle}
          `}
        >
          {task.priority || "None"}
        </span>

        {task.githubIssue && (
          <div
            className="
              flex
              items-center
              gap-1
              text-xs
              text-slate-500
            "
          >
            <GitBranch size={14} />
            {task.githubIssue}
          </div>
        )}
      </div>

      {/* Assignee */}
      <div
        className="
          flex
          items-center
          justify-between
          mb-4
        "
      >
        <div className="flex items-center gap-2">
          <div
            className="
              h-8
              w-8
              rounded-full
              bg-slate-900
              text-white
              text-sm
              font-semibold
              flex
              items-center
              justify-center
            "
          >
            {assigneeInitial}
          </div>

          <span
            className="
              text-sm
              text-slate-700
            "
          >
            {task.assignee ||
              "Unassigned"}
          </span>
        </div>

        <div
          className="
            flex
            items-center
            gap-1
            text-xs
            text-slate-500
          "
        >
          <CalendarDays
            size={14}
          />

          {task.dueDate ||
            "No due date"}
        </div>
      </div>

      {/* Footer */}
      <div
        className="
          pt-3
          border-t
          border-slate-100
          flex
          items-center
          justify-between
        "
      >
        <div
          className="
            flex
            items-center
            gap-1
            text-slate-500
            text-sm
          "
        >
          <MessageSquare
            size={15}
          />

          {commentsCount}
        </div>

        <div
          className="
            flex
            items-center
            gap-1
            text-slate-500
            text-sm
          "
        >
          <Paperclip
            size={15}
          />

          {attachmentsCount}
        </div>
      </div>
    </motion.div>
  );
}