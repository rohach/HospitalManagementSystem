import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/common/home/home";
import NotFound from "./components/pages/NotFound";
import "./layout.css";
import Doctors from "./components/common/Doctors/Doctors";
import Patients from "./components/common/Patients/Patients";
import Wards from "./components/common/Wards/Wards";
import Update from "./components/common/Patients/Update";

const Layout = ({ isLoggedIn, userRole, userData }) => {
  return (
    <div className="content">
      <div className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
          <Route
            path="doctors"
            element={
              <Doctors
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                userData={userData}
              />
            }
          />
          <Route
            path="patients"
            element={
              <Patients
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                userData={userData}
              />
            }
          />
          <Route
            path="wards"
            element={
              <Wards
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                userData={userData}
              />
            }
          />
          <Route path="/update/:id" element={<Update />} />
        </Routes>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
