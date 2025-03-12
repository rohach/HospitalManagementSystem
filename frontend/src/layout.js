import React from "react";
import Navbar from "./components/common/navbar/navbar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/common/home/home";
import Footer from "./components/common/footer/footer";
import "./layout.css";
import NotFound from "./components/pages/NotFound";

const Layout = () => {
  return (
    <div className="content">
      <Navbar />
      <div className="main">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
};

export default Layout;
