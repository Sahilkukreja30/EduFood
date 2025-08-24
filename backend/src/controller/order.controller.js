import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
export const createOrder = async (req, res) => {
  try {
    const { userId, foodItem } = req.body;

    // find user to check type
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const priority = user.type === "staff" ? 1 : 2;

    const order = new Order({
      userId,
      foodItem,
      priority
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