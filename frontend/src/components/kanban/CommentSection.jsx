// src/components/task/CommentSection.jsx
import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";

import {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
} from "../../services/commentServices";

import {handleApiError} from "../../utils/handleApiError"
import socket from "../../hooks/useSocket";


export default function CommentSection({ taskId, members = [] }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [activeMenu, setActiveMenu] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // ===== MENTION STATES =====
  const [selectedMentions, setSelectedMentions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionMode, setMentionMode] = useState(null); // "create" | "edit" | null

  // ===== AUTO-SCROLL REF =====
  const commentsEndRef = useRef(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getTaskComments(taskId);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error(
        "Failed to fetch comments:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchComments(true);
    }
  }, [taskId]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [comments.length]);

  useEffect(() => {
    const syncComments = () => {
      if (data.taskId !== taskId) return;
      fetchComments(false);
    };

    socket.on("commentCreated", syncComments);
    socket.on("commentUpdated", syncComments);
    socket.on("commentDeleted", syncComments);

    return () => {
      socket.off("commentCreated", syncComments);
      socket.off("commentUpdated", syncComments);
      socket.off("commentDeleted", syncComments);
    };
  }, [taskId]);

  // =========================
  // MENTION DETECTION
  // =========================

  const detectMention = (value, cursorPosition, mode) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@([^@\s]*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentionDropdown(true);
      setMentionMode(mode);
    } else {
      setMentionQuery("");
      setShowMentionDropdown(false);
      setMentionMode(null);
    }
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setCommentText(value);
    detectMention(value, e.target.selectionStart, "create");
  };

  const handleEditChange = (e) => {
    const value = e.target.value;
    setEditText(value);
    detectMention(value, e.target.selectionStart, "edit");
  };

  const filteredMentionMembers = members.filter((member) =>
    member.name?.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleSelectMention = (member) => {
    const replacement = `@${member.name} `;

    if (mentionMode === "edit") {
      setEditText((prev) => prev.replace(/@([^@\s]*)$/, replacement));
    } else {
      setCommentText((prev) => prev.replace(/@([^@\s]*)$/, replacement));
    }

    // Add the member ID to mentions if not already selected
    setSelectedMentions((prev) => {
      if (prev.includes(member._id)) return prev;
      return [...prev, member._id];
    });

    setShowMentionDropdown(false);
    setMentionQuery("");
    setMentionMode(null);
  };

  // =========================
  // RENDER COMMENT WITH MENTION HIGHLIGHTS
  // =========================

  const renderCommentText = (item) => {
    let parts = [item.comment];

    item.mentions?.forEach((mentionedUser) => {
      if (!mentionedUser?.name) return;

      const mentionText = `@${mentionedUser.name}`;
      const nextParts = [];

      parts.forEach((part) => {
        if (typeof part !== "string") {
          nextParts.push(part);
          return;
        }

        const splitParts = part.split(mentionText);

        splitParts.forEach((text, index) => {
          if (text) {
            nextParts.push(text);
          }

          if (index < splitParts.length - 1) {
            nextParts.push(
              <span
                key={`${mentionedUser._id}-${index}`}
                className="inline-flex px-1.5 py-0.5 mx-0.5 rounded-md bg-blue-50 text-blue-700 font-medium"
              >
                {mentionText}
              </span>
            );
          }
        });
      });

      parts = nextParts;
    });

    return parts;
  };

  // =========================
  // CREATE COMMENT
  // =========================

  const handleCreateComment = async () => {
    if (!commentText.trim() || sending) return;

    try {
      setSending(true);

      const response = await createComment(taskId, {
        comment: commentText.trim(),
        mentions: selectedMentions,
      });

      setComments((prev) => [...prev, response.data.comment]);

      // Reset
      setCommentText("");
      setSelectedMentions([]);
      setShowMentionDropdown(false);
    } catch (error) {
      console.error(
        "Failed to create comment:",
        error.response?.data || error.message
      );
    } finally {
      setSending(false);
    }
  };

  // =========================
  // START EDIT
  // =========================

  const startEditing = (comment) => {
    setEditingId(comment._id);
    setEditText(comment.comment);

    // Extract mention IDs from the comment (handle both populated and plain arrays)
    const mentionIds = comment.mentions?.map((m) =>
      typeof m === "string" ? m : m._id
    ) || [];
    setSelectedMentions(mentionIds);

    setActiveMenu(null);
  };

  // =========================
  // SAVE EDIT
  // =========================

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      const response = await updateComment(commentId, {
        comment: editText.trim(),
        mentions: selectedMentions,
      });

      setComments((prev) =>
        prev.map((item) =>
          item._id === commentId ? response.data.comment : item
        )
      );

      // Reset edit state
      setEditingId(null);
      setEditText("");
      setSelectedMentions([]);
    } catch (error) {
      console.error(
        "Failed to update comment:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // DELETE COMMENT
  // =========================

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((item) => item._id !== commentId));
      setActiveMenu(null);
    } catch (error) {
      handleApiError(error);
    }
  };

  // =========================
  // DATE FORMAT
  // =========================

  const formatCommentTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      {/* ===== FIXED HEADER ===== */}
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={20} className="text-slate-600" />
        <h3 className="font-semibold text-slate-800">Comments</h3>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
          {comments.length}
        </span>
      </div>

      {/* ===== SCROLLABLE COMMENTS LIST ===== */}
      <div className="max-h-[310px] overflow-y-auto pr-2 space-y-5">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div key={item} className="flex gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-28 h-3 bg-slate-200 rounded" />
                  <div className="w-full h-12 bg-slate-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-7 rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <MessageCircle size={26} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">No comments yet</p>
            <p className="text-xs text-slate-400 mt-1">Start the discussion</p>
          </div>
        ) : (
          comments.map((item) => (
            <div key={item._id} className="flex gap-3">
              {/* AVATAR */}
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {item.createdBy?.name
                  ?.split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "U"}
              </div>

              <div className="flex-1 min-w-0">
                {/* AUTHOR + MENU */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {item.createdBy?.name || "Unknown User"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatCommentTime(item.createdAt)}
                    </span>
                    {item.isEdited && (
                      <span className="text-xs text-slate-400">edited</span>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenu(activeMenu === item._id ? null : item._id)
                      }
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenu === item._id && (
                      <div className="absolute right-0 top-7 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                        <button
                          onClick={() => startEditing(item)}
                          className="w-full px-3 py-2 flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(item._id)}
                          className="w-full px-3 py-2 flex items-center gap-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* EDIT MODE */}
                {editingId === item._id ? (
                  <div className="mt-2">
                    <textarea
                      value={editText}
                      onChange={handleEditChange}
                      className="w-full resize-none border border-slate-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditText("");
                          setSelectedMentions([]);
                        }}
                        className="p-2 rounded-lg bg-slate-100 text-slate-600"
                      >
                        <X size={15} />
                      </button>
                      <button
                        onClick={() => handleUpdateComment(item._id)}
                        className="p-2 rounded-lg bg-primary text-white"
                      >
                        <Check size={15} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap break-words leading-6">
                    {renderCommentText(item)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}

        {/* Auto-scroll anchor */}
        <div ref={commentsEndRef} />
      </div>

      {/* ===== FIXED INPUT ===== */}
      <div className="pt-4 mt-4 border-t border-slate-100">
        <div className="relative">
          <textarea
            value={commentText}
            onChange={handleCommentChange}
            placeholder="Write a comment... Use @ to mention someone"
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-300 p-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />

          {/* MENTION DROPDOWN */}
          {showMentionDropdown && filteredMentionMembers.length > 0 && (
            <div className="absolute left-0 bottom-full mb-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-30 max-h-52 overflow-y-auto">
              {filteredMentionMembers.map((member) => (
                <button
                  key={member._id}
                  type="button"
                  onClick={() => handleSelectMention(member)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                    {member.name
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {member.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {member.role || "Member"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleCreateComment}
            disabled={!commentText.trim() || sending}
            className="absolute right-3 bottom-3 p-2 rounded-lg bg-primary text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}