import { Router } from "express";
import { paymentController, paymentVerifyController, premiumVerify } from "../controllers/payment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route('/payment/create').post(verifyJwt, paymentController);
router.route('/payment/webhook').post(paymentWithWebhook);
router.route('/premium/verify').get(premiumVerify);
export default router;