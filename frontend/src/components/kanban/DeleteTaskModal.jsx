import { Trash2, X } from "lucide-react";

export default function DeleteTaskModal({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[90]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-red-100 flex items-center justify-center">
                <Trash2 className="text-red-600" size={20} />
              </div>

              <div>
                <h2 className="font-bold text-lg text-slate-900">
                  Delete Task
                </h2>
                <p className="text-sm text-slate-500">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p className="text-slate-600">
              Are you sure you want to delete
            </p>

            <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="font-semibold text-slate-800 break-words">
                {taskTitle}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 pb-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-300 font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
            >
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </>
  );
}