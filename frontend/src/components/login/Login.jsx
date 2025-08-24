import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "./Login.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const LoginForm = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // 🔹 Loader state

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true); // start loader
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/user/login",
        data
      );
      console.log(response.data);
      const { accessToken, refreshToken, user } = response.data.data;

      // Save tokens and username
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("username", user.username);

      if (response.status === 200) {
        navigate("/order"); // or "/"
      }
    } catch (err) {
      console.error("Something went wrong", err);
    } finally {
      setLoading(false); // stop loader
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Log in to your Account</h2>
        <p className="subtitle">Welcome back! Please enter your details</p>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          {/* Username Field */}
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              {...register("username", { required: true })}
            />
          </div>

          {/* Password Field */}
          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password", { required: true })}
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
          {errors.password && <p className="error">Password is required</p>}

          {/* Continue */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Loading..." : "Continue"}
          </button>

          {/* Terms */}
          <p className="terms">
            By clicking continue, you have read and agree to our{" "}
            <a href="">Terms of Use</a>
          </p>

          {/* Divider */}
          <div className="divider">
            <hr />
            <span>or</span>
            <hr />
          </div>

          {/* Sign Up */}
          <p className="signup">
            Don't have an account?{" "}
            <Link to="/signup">Create new account now</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
