import { Server } from 'socket.io';
import crypto from 'crypto';
import { Chat } from '../models/chat.model.js';

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash('sha256')
    .update([userId, targetUserId].sort().join("$$"))
    .digest("hex");
}

const initializeSocket = (server) => {
  console.log("socket initialize");
  const io = new Server(server,  {
    // path: '/api/socket.io',
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    },
  })
  
  io.on("connection", (socket) => {

    
    //Handle events
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(`${firstName} Joined Room: ${roomId}`);
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ firstName, lastName, userId, targetUserId, text }) => {
      // save message 
      try {
        const roomId = getSecretRoomId(userId, targetUserId);
        console.log(firstName + " " + text);
        let chat = await Chat.findOne({
          participants: { $all : [userId, targetUserId]},
          
        });
        if (!chat) {
          chat = new Chat({
            participants: [userId, targetUserId],
            messages: [],
          }) 
        }

        chat.messages.push({
          senderId: userId,
          text
        })

        await chat.save();
        io.to(roomId).emit("messageReceived", {firstName, lastName, text});

      } catch (error) {
        console.log(error)
      }
    });

    socket.on("disconnect", () => {
      // console.log("❌ Client disconnected:");
    });
  });
}

export default initializeSocket;