import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Queue.css";

const Queue = () => {
  const [queue, setQueue] = useState([]);

  const fetchQueue = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/user/queue"
      );
      setQueue(response.data);
    } catch (err) {
      console.error("Error fetching queue", err);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000); // fetch every 3s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="queue-container">
      <h2>Live Order Queue</h2>
      <div className="queue-list">
        {queue.length === 0 ? (
          <p>No pending orders</p>
        ) : (
          queue.map((order, index) => (
            <div
              key={order._id}
              className={`queue-item ${
                order.userId.type === "staff" ? "staff" : "student"
              }`}
            >
              <span className="queue-rank">#{index + 1}</span>
              <span className="queue-user">{order.userId.fullName}</span>
              <span className="queue-item-name">{order.foodItem}</span>
              <span className="queue-role">{order.userId.type}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Queue;
