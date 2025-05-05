import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const Profile = AsyncHandler(async (req, res)=> {
    const user = req.user;
    console.log(user);
    if(!user){
        throw new ApiError(401, "Unauthorized access - user not found")
    }
    return res.status(200).json(new ApiResponse(200, user, "profile fetched successfully"))
})


export {Profile}