import { Router } from "express";
import { Profile } from "../controllers/profile.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/profile/view").get(verifyJwt, Profile);


export default router