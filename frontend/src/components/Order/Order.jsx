// src/pages/OrderForm.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

const OrderForm = () => {
  const [message, setMessage] = useState("");

  // react-hook-form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await axios.post(
        "http://localhost:3000/api/v1/user/order",
        data,{ 
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // if auth required
      }},
      );
      setMessage("Order placed successfully!");
      reset(); // clear form
    } catch (err) {
      setMessage("Failed to place order. Try again.");
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h2>Place Your Order</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Food Item Input */}
        <input
          type="text"
          placeholder="Enter food item"
          {...register("foodItem", { required: "Food item is required" })}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
            border: errors.foodItem ? "1px solid red" : "1px solid #ccc",
          }}
        />
        {errors.foodItem && (
          <p style={{ color: "red", marginBottom: "10px" }}>
            {errors.foodItem.message}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            padding: "12px 24px",
            background: "#e23744",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Order
        </button>
      </form>

      {/* Success / Error Message */}
      {message && <p style={{ marginTop: "20px", color: "#e23744" }}>{message}</p>}
    </div>
  );
};

export default OrderForm;
