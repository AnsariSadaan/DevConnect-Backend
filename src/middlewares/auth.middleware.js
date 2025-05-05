import  jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

export const verifyJwt = AsyncHandler(async (req, res, next)=> {
        const {token} = req.cookies;
        if(!token){
            throw new ApiError(401, "Please Login in to access this resource");
        }
        const decodedObj = jwt.verify(token, process.env.JWT_SECRET)
        const {_id} = decodedObj;
        const user = await User.findById(_id);
        if(!user){
            throw new ApiError(401, "user not found");
        } 
        req.user = user;
        next();
})