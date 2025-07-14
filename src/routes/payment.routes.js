import { Router } from "express";
import  Payment  from "../controllers/payment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route('/payment/create').post(verifyJwt, Payment);

export default router;