import { Payment } from "../models/payment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import membershipAmount from "../utils/constants.js";
import razorpayInstance from '../utils/Razorpay.js';

const paymentController = AsyncHandler(async (req, res) => {

    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    // ✅ Validate membership type
    if (!membershipType || !membershipAmount[membershipType]) {
        throw new ApiError(400, "Invalid or missing membershipType");
    }

    const order = await razorpayInstance.orders.create({
        amount: membershipAmount[membershipType] * 100, //in ps
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
            firstName,
            lastName,
            emailId,
            membershipType: membershipType,
        },
    })

    console.log(order);
    const { id: orderId, status, amount, currency, receipt, notes } = order
    const payment = new Payment({
        userId: req.user._id,
        orderId,
        status,
        amount,
        currency,
        receipt,
        notes
    })

    //save it in database
    const savedPayment = await payment.save();
    if (!savedPayment) {
        throw new ApiError(500, "Failed to save payment in the database");
    }
    //return back my order details to frontend
    return res.status(200).json(new ApiResponse(200, {
        amount,
        currency,
        notes,
        orderId, keyId: process.env.RAZORPAY_KEY_ID
    }, "order created successfully"));


})

export { paymentController };