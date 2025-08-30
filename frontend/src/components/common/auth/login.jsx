import React, { useState } from "react";
import "./login.css";
import Lottie from "react-lottie";
import LoginAnimation from "../../../animations/login.json";
import { postData } from "../../../utils/api";
import ToastifyComponent, { notify } from "../../pages/ToastMessage";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: LoginAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await postData("auth/login", { email, password });
      notify(response?.message, "success");

      // Store token and user info
      localStorage.setItem("authToken", response?.token);
      localStorage.setItem("user", JSON.stringify(response?.user));

      // Redirect based on role
      if (response.user.role === "patient") {
        window.location.href = `/profile/${response.user.id}`;
      } else {
        window.location.href = "/"; // admin or other roles
      }
    } catch (error) {
      notify(error.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <ToastifyComponent />
      <div className="container login_container">
        <div className="login_left">
          <h1>Sign In</h1>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              className="input_field"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="input_field"
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="submit" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>
          <p className="register">
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "rgb(100, 100, 100)" }}>
              <span style={{ fontWeight: "bold", cursor: "pointer" }}>
                Click here.
              </span>
            </Link>
          </p>
        </div>
        <div className="login_right">
          <Lottie options={defaultOptions} height={500} width={500} />
        </div>
      </div>
    </div>
  );
};

export default Login;
