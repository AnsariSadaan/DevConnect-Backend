import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { Feed } from "../controllers/user.controller.js";
const router = Router();


router.route('/feed').get(verifyJwt, Feed);

export default router;