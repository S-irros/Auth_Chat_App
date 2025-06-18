import messageModel from "../../../../DB/models/Message.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";

// 💬 **Get Messages Between Two Users**
export const getMessages = asyncHandler(async (req, res, next) => {
  const userOne = req.user._id;
  const userTwo = req.params.userId;

  if (!userOne || !userTwo) {
    return next(new Error("Sender and Receiver IDs are required", { cause: 400 }));
  }

  // تحقق من وجود الـ Token
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new Error("Authorization token is required", { cause: 401 }));
  }

  // Fetch messages between the two users
  const messages = await messageModel
    .find({
      $or: [
        { senderId: userOne, receiverId: userTwo },
        { senderId: userTwo, receiverId: userOne },
      ],
    })
    .sort({ createdAt: 1 })
    .select("_id senderId receiverId content createdAt");

  if (!messages.length) {
    return res.status(200).json({
      status: "success",
      message: "No messages found between these users.",
      result: [],
    });
  }

  res.status(200).json({
    status: "success",
    message: "Messages retrieved successfully.",
    result: messages,
  });
});