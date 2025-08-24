import mongoose from "mongoose";
//schema for my order model with priorities assigned
const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    foodItem: { type: String, required: true },
    status: { type: String, enum: ["pending", "preparing", "completed"], default: "pending" },
    priority: { type: Number, required: true }, // 1 = staff, 2 = student
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);