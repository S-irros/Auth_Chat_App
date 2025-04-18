import mongoose from "mongoose";

const gradeLevelSchema = new mongoose.Schema({
  gradeLevelId: { 
    type: Number, 
    required: true, 
    unique: true, 
    default: () => Math.floor(1000 + Math.random() * 9000)
  },
  subjects: { type: [String], required: true, default: [] },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const GradeLevel = mongoose.model("GradeLevel", gradeLevelSchema);
console.log("GradeLevel model registered");
export default GradeLevel;