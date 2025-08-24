import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "./SignUp.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";  
const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const navigate = useNavigate(); // ⏩ Navigation hook

    const payload = {
      ...data,
      isPublic: true,
      rating: 0,
      completedSwaps: 0,
      isBanned: false,
      createdAt: new Date().toISOString(),
      profilePhoto: "",
    };

    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/user/signup",
        payload
      );
      console.log(res.message);
      if (res.status === 201) {
        reset();
      } else {
        alert(`⚠️ ${res.data.message}`);
      }
      navigate("/login");
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Create Your Account</h2>
        <p className="subtitle">Fill out the details below</p>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Full Name"
              {...register("name", { required: "Name is required" })}
            />
          </div>
          {errors.name && <p className="error">{errors.name.message}</p>}

          <div className="input-group">
            <input
              type="username"
              placeholder="Username"
              {...register("username", {
                required: "Username is required",
              })}
            />
          </div>

          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
            />
            <span
              className="toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={18} />
              ) : (
                <AiOutlineEye size={18} />
              )}
            </span>
          </div>
          {errors.password && (
            <p className="error">{errors.password.message}</p>
          )}


          <label className="radio-label">UserType</label>
          <div className="radio-group">
            <select
              {...register("availability", {
                required: "Please select availability",
              })}
            >
              <option value="">Select Type</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">
            Create Account
          </button>

          {message && <p className="error">{message}</p>}

          <p className="signup">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
