import React, { useState } from "react";
import "./login.css";
import Lottie from "react-lottie";
import LoginAnimation from "../../../animations/register.json";
import { postData } from "../../../utils/api";
import ToastifyComponent, { notify } from "../../pages/ToastMessage"; // Import notify function
import { Link } from "react-router-dom";

const conditionOptions = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Heart Disease",
  "Allergies",
  "Kidney Disease",
  "Liver Disease",
  "Cancer",
];

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [conditions, setConditions] = useState([]);
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

    try {
      const response = await postData("auth/register", {
        name,
        email,
        password,
        conditions, // include conditions in registration
      });
      notify(response?.message, "success");
      window.location.href = "/";
    } catch (error) {
      notify(error.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConditionChange = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setConditions(selected);
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

            {/* Conditions Multi-Select */}
            <label
              htmlFor="conditions"
              style={{ marginTop: "10px", display: "block" }}
            >
              Medical Conditions:
            </label>
            <select
              id="conditions"
              multiple
              value={conditions}
              onChange={handleConditionChange}
              className="input_field"
              style={{ height: "100px", padding: "8px" }}
            >
              {conditionOptions.map((cond, idx) => (
                <option key={idx} value={cond}>
                  {cond}
                </option>
              ))}
            </select>

            <button className="submit" type="submit" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
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
