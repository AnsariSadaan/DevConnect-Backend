import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

const Feed = AsyncHandler(async (req, res)=> {
    const loggedInUser = req.user;

    // const hideUsersFromFeed;

    const user = await User.find({
        _id: {$ne: loggedInUser._id}
    })
        .select(USER_SAFE_DATA)

    if(!user){
        throw new ApiError(401, "Feeds not found");
    }

    return res.status(200).json(new ApiResponse(200, user, "feed fetched successfully!"));
})


export {Feed}