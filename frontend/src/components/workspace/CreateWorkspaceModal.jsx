import { useState } from "react";
import { handleSuccess } from "../../utils/handleApiError";

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  onCreate,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    onCreate({
      name,
      description,
    });

    setName("");
    setDescription("");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          Create Workspace
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Workspace Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg p-3 mb-3"
            required
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg p-3 mb-4"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}