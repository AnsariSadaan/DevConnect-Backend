import { ConnectionRequest } from "../models/connectionRequest.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import  sendEmail  from "../utils/sendEmail.js";

const sendRequest = AsyncHandler(async (req, res)=> {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const allowedStatus = ["ignored", "interested"];
    if(!allowedStatus.includes(status)){
        throw new ApiError(400, `Invalid status type: ${status}`)
    }

    const toUser = await User.findById(toUserId);
    if(!toUser){
        throw new ApiError(404, "Recipent user not found");
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
            {fromUserId, toUserId},
            {fromUserId: toUserId, toUserId: fromUserId},
        ],
    })

    if(existingConnectionRequest){
        throw new ApiError(409, "Connection Request Already Exists!!"); 
    }

    const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
    })

    const data = await connectionRequest.save();

    const emailRes = await sendEmail.run(
        "A new friend request from " + req.user.firstName, 
        req.user.firstName  + " is " + status + " in " + toUser.firstName
    );
    console.log(emailRes);

    if(!data){
        throw new ApiError(500, "Failed to create connection request");
    }
    return res.status(201).json(new ApiResponse(201, data, `${req.user.firstName} is ${status} in ${toUser.firstName}`))
});


const reviewRequest = AsyncHandler(async (req, res)=> {
    const loggedInUser = req.user;
    const {status, requestId} = req.params;

    const allowedStatus = ["accepted", 'rejected'];
    if(!allowedStatus.includes(status)){
        throw new ApiError(400, "Invalid status provided. Must be 'accepted' or 'rejected'.");
    }

    const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
    });

    if(!connectionRequest){
        throw new ApiError(404, "Connection request not found or already reviewed.");
    }

    connectionRequest.status = status;
    const data = await connectionRequest.save();
    if(!data){
        throw new ApiError(500, "Failed to update connection request status.");
    }

    return res.status(200).json(new ApiResponse(200, data, `Connection request ${status}`))
});


export {sendRequest, reviewRequest}