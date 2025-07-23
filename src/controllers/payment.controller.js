// import { AsyncHandler } from "../utils/AsyncHandler.js";
// // import razorpayInstance from '../utils/Razorpay.js' 

// const Payment = AsyncHandler(async (req, res)=> {
//     const order = await razorpayInstance.orders.create({
//         "amount": 50000, //it means 500 rps it consider as paisa not in rupees 
//         "currency": "INR",
//         "receipt": "receipt#1",
//         "notes": {
//             "firstName": "value3",
//             "lastName": "value2",
//             "membershipType": "silver"
//         },
//     });
//     // save in my db
//     console.log(order);
//     // return back my order details to frontend 
//     return res.status(200).json({order})
// })


// export default Payment;