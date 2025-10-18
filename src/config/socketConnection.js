import { Server } from 'socket.io';
import crypto from 'crypto';

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

    socket.on("sendMessage", ({ firstName, userId, targetUserId, text }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " " + text);
      io.to(roomId).emit("messageReceived", {firstName, text});
    });

    socket.on("disconnect", () => {
      // console.log("❌ Client disconnected:");
    });
  });
}

export default initializeSocket;