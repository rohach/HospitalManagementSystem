import React from "react";
<<<<<<< HEAD
import Navbar from "./components/common/navbar/navbar";
=======
>>>>>>> cd162b2 (Backend and Frontend updated)
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/common/home/home";
import Footer from "./components/common/footer/footer";
import "./layout.css";
import NotFound from "./components/pages/NotFound";

const Layout = () => {
  return (
    <div className="content">
<<<<<<< HEAD
      <Navbar />
=======
>>>>>>> cd162b2 (Backend and Frontend updated)
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
