import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: `{VALUE} is incorrect status type`,
        },
    }
}, { timestamps: true });


connectionRequestSchema.index({fromUserId:1, toUserId:1});
connectionRequestSchema.pre("save", function (next) {
    const connectionRequest = this;
    // Check if the fromUserId is same as toUserId
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new ApiError(403, "cannot send connection request to yourself")
    }
})

export const ConnectionRequest = mongoose.model("connectionRequest", connectionRequestSchema)