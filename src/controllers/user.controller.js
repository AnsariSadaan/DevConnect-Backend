import { ConnectionRequest } from "../models/connectionRequest.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

const Feed = AsyncHandler(async (req, res) => {
    const loggedInUser = req.user;

    //find all connection requests involving the logged-in user
    const sentConnectionrequests = await ConnectionRequest.find({
        $or: [
            { fromUserId: loggedInUser._id },
            { toUserId: loggedInUser._id },
        ],
        status: { $in: ["interested", "accepted"] },
    });

    // exlcude user from feed who have already send request or accpted
    const excludedUserIds = new Set();
    sentConnectionrequests.forEach(req => {
        excludedUserIds.add(req.fromUserId.toString());
        excludedUserIds.add(req.toUserId.toString());
    })

    //always exclude logged in user 
    excludedUserIds.add(loggedInUser._id.toString());


    // fecth users not involved in any existing request or connection 
    const users = await User.find({
        _id: { $nin: Array.from(excludedUserIds) },
    }).select(USER_SAFE_DATA)

    if (!users) {
        throw new ApiError(401, "Feeds not found");
    }

    return res.status(200).json(new ApiResponse(200, users, "feed fetched successfully!"));
})

const userRequestsReceived = AsyncHandler(async (req, res) => {
    const loggedInUser = req.user;
    const connectionrequests = await ConnectionRequest.find({
        toUserId: loggedInUser._id,
        status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    if (!connectionrequests || connectionrequests.length === 0) {
        throw new ApiError(404, "No connection requests found")
    }

    return res.status(200).json(new ApiResponse(200, connectionrequests, "Data Fetched Successfully!"))
})

const userConnection = AsyncHandler(async (req, res) => {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
        $or: [
            { toUserId: loggedInUser._id, status: "accepted" },
            { fromUserId: loggedInUser._id, status: "accepted" },
        ],
    })
        .populate("fromUserId", USER_SAFE_DATA)
        .populate("toUserId", USER_SAFE_DATA);

    console.log(connectionRequests);
    if (!connectionRequests || connectionRequests.length === 0) {
        throw new ApiError(404, "No connections found");
    }

    const data = connectionRequests.map((row) => {
        return row.fromUserId._id.toString() === loggedInUser._id.toString() ? row.toUserId : row.fromUserId;
    });
    return res.status(200).json(new ApiResponse(200, data, "Connection fetched successfully"));
})

export { Feed, userRequestsReceived, userConnection }