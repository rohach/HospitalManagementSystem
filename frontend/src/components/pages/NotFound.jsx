import React from "react";
import Lottie from "react-lottie";
import notFound from "../../animations/notFound.json";

const NotFound = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: notFound,
    renderSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const reload = () => {
    window.location.reload();
  };
  return (
    <div>
      <div className="animationBody">
        <div className="animation" onClick={reload}>
          <Lottie options={defaultOptions} height={600} width={600} />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
