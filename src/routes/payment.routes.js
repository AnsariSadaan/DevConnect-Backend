import { Router } from "express";
import { paymentController, paymentVerifyController } from "../controllers/payment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route('/payment/create').post(verifyJwt, paymentController);
router.route('payment/webhook').post(paymentVerifyController);
export default router;