import { Router } from "express";
import { paymentController } from "../controllers/payment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route('/payment/create').post(verifyJwt, paymentController);
export default router;