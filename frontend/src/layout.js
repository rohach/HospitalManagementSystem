import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/common/home/home";
import NotFound from "./components/pages/NotFound";
import "./layout.css";
import Doctors from "./components/common/Doctors/Doctors";

const Layout = () => {
  return (
    <div className="content">
      <div className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
          <Route path="doctors" element={<Doctors />} />
        </Routes>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
