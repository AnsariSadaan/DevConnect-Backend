import { Router } from "express";
import { chatController } from "../controllers/chat.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route('/chat/:targetUserId').get(verifyJwt, chatController);

export default router;