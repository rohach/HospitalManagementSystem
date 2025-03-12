import React from "react";
import Lottie from "react-lottie";
import loading from "../../animations/loading.json";
import "./animation.css";

const Loading = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loading,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <div className="animationBody">
      <div className="animation">
        <Lottie options={defaultOptions} height={400} width={400} />
        {/* <p className="animationText">Loading...</p> */}
      </div>
    </div>
  );
};

export default Loading;
