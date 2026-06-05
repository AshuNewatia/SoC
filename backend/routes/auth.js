import { Router } from "express"
import * as authController from "../controllers/auth.js"

const authRouter = Router();

authRouter.post('/signup', authController.signup)

export default authRouter;