import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

/* GET ALL TASKS */
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();

    res.json(tasks);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to fetch tasks",
      error:
        error.message,
    });
  }
});

/* CREATE TASK */
router.post("/", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    // const task = await Task.create(req.body);

    const {
  id,
  _id,
  ...taskData
} = req.body;

const task =
  await Task.create(
    taskData
  );

    console.log("CREATED:", task);

    res.status(201).json(task);
  } catch (err) {
    console.error("POST ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

/* UPDATE TASK */
router.put("/:id", async (req, res) => {
  try {
    const task =
      await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

  /* DELETE TASK */

router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);

    res.json({
      message: "Task deleted successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to delete task",
    });
  }
});

    res.json(task);
  } catch (error) {
    console.error(
      "Update task error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update task",
      error:
        error.message,
    });
  }
});

export default router;