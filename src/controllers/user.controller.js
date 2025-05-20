import { ConnectionRequest } from "../models/connectionRequest.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

const Feed = AsyncHandler(async (req, res) => {
    const loggedInUser = req.user;

    // const hideUsersFromFeed;

    const user = await User.find({
        _id: { $ne: loggedInUser._id }
    })
        .select(USER_SAFE_DATA)

    if (!user) {
        throw new ApiError(401, "Feeds not found");
    }

    return res.status(200).json(new ApiResponse(200, user, "feed fetched successfully!"));
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
    const connectionRequests = ConnectionRequest.find({
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