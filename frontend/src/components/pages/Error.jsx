import React from "react";
import Lottie from "react-lottie";
import error from "../../animations/error.json";
import "./animation.css";

const Error = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: error,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const reload = () => {
    window.location.reload();
  };
  return (
    <div className="animationBody" onClick={reload}>
      <div className="animation">
        <Lottie options={defaultOptions} height={700} width={700} />
      </div>
    </div>
  );
};

export default Error;
