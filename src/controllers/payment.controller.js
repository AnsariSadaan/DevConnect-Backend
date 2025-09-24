import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import { Payment } from "../models/payment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import membershipAmount from "../utils/constants.js";
import razorpayInstance from '../utils/Razorpay.js';
import { User } from "../models/user.model.js";

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

// const paymentVerifyController = AsyncHandler(async (req, res) => {
//     const webhookSignature = req.get('X-Razorpay-Signature');
//     const isWebhokkValid = validateWebhookSignature(JSON.stringify(req.body), webhookSignature, process.env.RAZORPAY_WEBHOOK_SECRET);

//     if (!isWebhokkValid) {
//         throw new ApiError(400, "WebHook Signature is invalid");
//     }

//     console.log(req.body);
//     const paymentDetails = req.body.payload.payment.entity;

//     //update the payment in db
//     const payment = await Payment.findOne({orderId: paymentDetails.order_id})
//     payment.status = paymentDetails.status;
//     await payment.save();

//     const user = await User.findOne({_id: payment.userId});
//     user.isPremium = true;
//     user.membershipType = payment.notes.membershipType;
//     await user.save();
//     // updat the user as premium customer
    
    
//     // if (req.body.event == "payment.captured") { 
        
//     // }
    
//     // if (req.body.event == "payment.failed") {
        
//     // }
    
//     // return success response from webhook
//     return res.status(200).json(new ApiResponse(200, {}, "web hook recieved successfully"));
// })

const paymentVerifyController = AsyncHandler(async (req, res) => {
    console.log("------ Payment Webhook Triggered ------");
    console.log("Headers:", req.headers);
    console.log("Raw Body:", req.body);

    const webhookSignature = req.get('X-Razorpay-Signature');
    console.log("Webhook Signature:", webhookSignature);

    const isWebhookValid = validateWebhookSignature(
        JSON.stringify(req.body),
        webhookSignature,
        process.env.RAZORPAY_WEBHOOK_SECRET
    );
    console.log("Is Webhook Valid:", isWebhookValid);

    if (!isWebhookValid) {
        console.error("❌ Invalid Webhook Signature");
        throw new ApiError(400, "WebHook Signature is invalid");
    }

    try {
        const paymentDetails = req.body.payload.payment.entity;
        console.log("Payment Details:", paymentDetails);

        // Find Payment
        const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
        console.log("DB Payment Record:", payment);

        if (!payment) {
            console.error("❌ Payment record not found for order:", paymentDetails.order_id);
            throw new ApiError(404, "Payment record not found");
        }

        payment.status = paymentDetails.status;
        await payment.save();
        console.log("✅ Payment Updated:", payment);

        // Find User
        const user = await User.findOne({ _id: payment.userId });
        console.log("DB User Record:", user);

        if (!user) {
            console.error("❌ User not found for payment:", payment.userId);
            throw new ApiError(404, "User not found");
        }

        user.isPremium = true;
        user.membershipType = payment.notes?.membershipType || "default";
        await user.save();
        console.log("✅ User Updated:", user);

        // Optional event logging
        console.log("Event Type:", req.body.event);

        return res.status(200).json(new ApiResponse(200, {}, "Webhook received successfully"));
    } catch (err) {
        console.error("❌ Error in Payment Webhook Handler:", err);
        throw err;
    }
});


export { paymentController, paymentVerifyController };