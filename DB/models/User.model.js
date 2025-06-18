import mongoose, { model, Schema, Types } from "mongoose";
import GradeLevel from "./gradeLevelModel.js";

const userSchema = new Schema(
  {
    randomId: { type: Number, unique: true, required: true },
    name: { type: String, min: 3, max: 20 },
    email: { type: String, required: true, unique: true },
    gradeLevelId: { type: Number, required: true },
    gradeLevelRef: { type: mongoose.Schema.Types.ObjectId, ref: "GradeLevel" },
    scientificTrack: { type: Number, default: null },
    subjects: [{ type: Number }],
    password: { type: String, required: true },
    status: { type: String, default: "not Active", enum: ["Active", "not Active"] },
    availability: { type: String, default: "Offline", enum: ["Online", "Offline"] },
    gender: { type: Number, default: 1, enum: [1, 2] },
    role: { type: String, default: "user", enum: ["user"] },
    isConfirmed: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    profilePic: String,
    profilePicPublicId: String,
    totalPoints: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    activationCode: String,
    otp: String,
    otpexp: Date,
    permanentlyDeleted: Date,
    changeAccountInfo: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

userSchema.virtual('trackDetails', {
  ref: 'ScientificTrack',
  localField: 'scientificTrack',
  foreignField: 'trackId',
  justOne: true,
});

userSchema.virtual("subjectsDetails", {
  ref: "Subject",
  localField: "subjects",  
  foreignField: "subjectId",
  justOne: false,
});


const userModel = mongoose.models.User || model("User", userSchema);
export default userModel;