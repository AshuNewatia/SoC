import PersonalActivity from "../models/PersonalActivity.js";

export const getPersonalActivities = async (req, res) => {
  try {
    const activities = await PersonalActivity.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(activities);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const createPersonalActivity = async (req, res) => {
  try {
    const activity = await PersonalActivity.create({
      user: req.user._id,
      action: req.body.action,
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};