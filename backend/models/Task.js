import mongoose from "mongoose"

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        priority: { type: String, enum: ["Low","Medium","High"], required: true },
        status: { type: String, enum: ["todo","progress","completed"] , deafult: "todo"},
        workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
        assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        dueDate: { type: Date },
    },
    {
        timestamps: true
    }
)

export default mongoose.model("Task",taskSchema);