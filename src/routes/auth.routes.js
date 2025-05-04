import { Router } from "express";
import { Login, Logout, Signup } from "../controllers/auth.controller.js";
const router = Router();


router.route('/signup').post(Signup);
router.route('/login').post(Login);
router.route('/logout').post(Logout);


export default router;