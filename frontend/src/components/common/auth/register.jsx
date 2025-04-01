import React, { useState } from "react";
import "./login.css";
import Lottie from "react-lottie";
import LoginAnimation from "../../../animations/register.json";
import { postData } from "../../../utils/api";
import ToastifyComponent, { notify } from "../../pages/ToastMessage"; // Import notify function
import { Link } from "react-router-dom";

const Login = () => {
  const [name, setName] = useState("");
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

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await postData("auth/register", {
        name,
        email,
        password,
      });
      notify(response?.message, "success");
      window.location.href = "/";
    } catch (error) {
      notify(error.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <ToastifyComponent />
      <div className="container login_container">
        <div className="login_right">
          <Lottie options={defaultOptions} height={500} width={500} />
        </div>
        <div className="login_left">
          <h1>Sign Up</h1>
          <form onSubmit={handleLogin}>
            <input
              type="name"
              className="input_field"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
              {loading ? "Logging in..." : "Sign Up"}
            </button>
          </form>
          <p className="register">
            Already have an account?{" "}
            <Link to="/" style={{ color: "rgb(100, 100, 100)" }}>
              <span style={{ fontWeight: "bold", cursor: "pointer" }}>
                Click here.
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
