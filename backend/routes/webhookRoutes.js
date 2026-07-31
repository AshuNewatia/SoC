import express from "express";
import { handleGithubWebhook } from "../controllers/webhookController.js";

const router = express.Router();

router.get("/github", (req, res) => {
  res.send("Webhook route is active! Send a POST request from GitHub.");
});

router.post("/github", handleGithubWebhook);

export default router;