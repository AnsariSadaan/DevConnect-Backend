import { Chat } from "../models/chat.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const chatController = AsyncHandler(async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  let chat = await Chat.findOne({
    participants: { $all: [userId, targetUserId] },
  }).populate({
    path: "messages.senderId",
    select: " firstName lastName",
  });

  if(!chat){
    chat = new Chat({
      participants: [userId, targetUserId], 
      messages: [],
    })
    await chat.save();
  }

  return res.status(200).json(new ApiResponse(200, chat, "chats are fetched successfully!"));

})


export { chatController }