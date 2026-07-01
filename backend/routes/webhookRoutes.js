import express from "express";
import { handleGithubWebhook } from "../controllers/webhookController.js";

const router = express.Router();

router.post("/github", express.json(), handleGithubWebhook);

export default router;