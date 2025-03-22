import { Server } from "socket.io";
import http from "http";
import express from "express";
import messageModel from "../DB/models/Message.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

const userSocketMap = new Map();

export function getReceiverSocketId(userId) {
  return userSocketMap.get(userId);
}

const sendMessage = async (message) => {
  try {
    const { senderId, receiverId } = message;
    const senderSocketId = userSocketMap.get(senderId);
    const receiverSocketId = userSocketMap.get(receiverId);

    // Save message to DB
    const createMessage = await messageModel.create(message);
    const messageData = await messageModel
      .findById(createMessage._id)
      .populate("senderId", "_id email name ")
      .populate("receiverId", "_id email name ")
      .lean();

    if (!messageData) return;

    // Emit message to sender and receiver if online
    [senderSocketId, receiverSocketId].forEach((socketId) => {
      if (socketId) io.to(socketId).emit("receiveMessage", messageData);
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

//Update Message Function (Allowed only within 15 min)
const updateMessage = async ({ messageId, newContent }) => {
  try {
    const message = await messageModel.findById(messageId);
    if (!message) return;

    const createdAt = new Date(message.createdAt);
    const now = new Date();
    const timeDiff = (now - createdAt) / (1000 * 60); // Difference in minutes

    if (timeDiff > 15) {
      console.log("Update not allowed after 15 minutes.");
      return;
    }

    // Update message in DB
    const updatedMessage = await messageModel
      .findByIdAndUpdate(
        messageId,
        { content: newContent },
        { new: true } // Return the updated document
      )
      .populate("senderId", "_id email name")
      .populate("receiverId", "_id email name")
      .lean();

    if (!updatedMessage) return;

    const { senderId, receiverId } = updatedMessage;
    const senderSocketId = userSocketMap.get(senderId._id);
    const receiverSocketId = userSocketMap.get(receiverId._id);

    // Emit updated message to sender and receiver if online
    [senderSocketId, receiverSocketId].forEach((socketId) => {
      if (socketId) io.to(socketId).emit("messageUpdated", updatedMessage);
    });
  } catch (error) {
    console.error("Error updating message:", error);
  }
};

//Delete Message Function (Allowed only within 15 min)
const deleteMessage = async (messageId) => {
  try {
    const message = await messageModel.findById(messageId);
    if (!message) return;

    const createdAt = new Date(message.createdAt);
    const now = new Date();
    const timeDiff = (now - createdAt) / (1000 * 60); // Difference in minutes

    if (timeDiff > 15) {
      console.log("Delete not allowed after 15 minutes.");
      return;
    }

    const { senderId, receiverId } = message;
    const senderSocketId = userSocketMap.get(senderId);
    const receiverSocketId = userSocketMap.get(receiverId);

    // Delete message from DB
    await messageModel.findByIdAndDelete(messageId);

    // Emit deleted message ID to sender and receiver if online
    [senderSocketId, receiverSocketId].forEach((socketId) => {
      if (socketId) io.to(socketId).emit("messageDeleted", { messageId });
    });
  } catch (error) {
    console.error("Error deleting message:", error);
  }
};

//  Socket Connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap.set(userId, socket.id);
    console.log(`Mapped user ${userId} to socket ${socket.id}`);
  }

  socket.on("join", (roomID) => {
    socket.join(roomID);
    console.log(`User ${socket.id} joined room: ${roomID}`);
  });

  socket.on("sendMessage", sendMessage);
  socket.on("updateMessage", updateMessage);
  socket.on("deleteMessage", deleteMessage);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`Removed user ${userId} from socket map`);
        break;
      }
    }
  });

  socket.on("error", (err) => {
    console.error(`⚠️ Socket.IO Error: ${err.message}`);
  });
});

export { io, app, server };
