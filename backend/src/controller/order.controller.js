import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
export const createOrder = async (req, res) => {
  try {
    const { foodItem } = req.body;
    const token = req.cookies.accessToken;
    if (!token) {
      throw new ApiError(401, "No token");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded._id;

    // ✅ fix here
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log(user.userType);
    
    const priority = user.userType === "staff" ? 1 : 2;

    const order = new Order({
      foodItem,
      priority,
      userId   // ✅ add this so populate works later
    });

    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Error placing order", error: err.message });
  }
};

// Get live queue (priority scheduling)
export const getQueue = async (req, res) => {
  try {
    const queue = await Order.find({ status: "pending" })
      .populate("userId", "fullName type") // optional: show user info
      .sort({ priority: 1, createdAt: 1 }); // scheduling rule

    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: "Error fetching queue", error: err.message });
  }
};
export const completeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: "completed" },
      { new: true }
    );
    res.json({ message: "Order completed", order });
  } catch (err) {
    res.status(500).json({ message: "Error completing order", error: err.message });
  }
};