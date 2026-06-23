import QuickNote from "../models/QuickNote.js";

export const getMyNotes = async (req, res) => {
  try {
    const notes = await QuickNote.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNote = async (req, res) => {
  try {
    const note = await QuickNote.create({
      title: req.body.title,
      content: req.body.content,
      user: req.user._id,
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await QuickNote.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    res.json({
      message: "Note deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const note = await QuickNote.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        title: req.body.title,
        content: req.body.content,
      },
      { new: true }
    );

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};