import mongoose, { model, Schema, Types } from "mongoose";

const messageSchema = new Schema(
  {
    senderId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
messageSchema.pre("find", function () {
  this.where({ isDeleted: false });
});
const messageModel = mongoose.models.Message || model("Message", messageSchema);
export default messageModel;
