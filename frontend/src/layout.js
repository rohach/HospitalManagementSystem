import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/common/home/home";
import NotFound from "./components/pages/NotFound";
import "./layout.css";
import Doctors from "./components/common/Doctors/Doctors";
import Patients from "./components/common/Patients/Patients";
import Wards from "./components/common/Wards/Wards";
import Update from "./components/common/Patients/Update";
import Records from "./components/common/Records/Records";
import Profile from "./components/common/Profile/profile";
import Appointments from "./components/common/Appointments/Appointments";
import NotificationList from "./components/common/notifications/notification";
import Billing from "./components/common/billing/Billing";
import PatientBilling from "./components/common/patientBlling/patientBilling";
import MyAppointments from "./components/common/myAppointments/myAppointments";
import MyRecords from "./components/common/myRecords/MyRecords";
import PatientDashboard from "./components/common/home/patientDashboard";
import AdminAi from "./components/common/admin/adminAI";

// ✅ Import Chatbot popup
import ChatbotPopup from "./components/common/chatBot/ChatbotPopup";

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
          <Route
            path="records"
            element={
              <Records
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                userData={userData}
              />
            }
          />
          <Route
            path="profile/:id"
            element={
              <Profile
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                userData={userData}
              />
            }
          />
          <Route
            path="appointments"
            element={
              <Appointments
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                userData={userData}
              />
            }
          />
          <Route
            path="notification"
            element={
              <NotificationList
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                userData={userData}
              />
            }
          />
          <Route
            path="bills"
            element={
              <Billing
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                userData={userData}
              />
            }
          />
          <Route
            path="myBills"
            element={
              <PatientBilling
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                userData={userData}
              />
            }
          />
          <Route
            path="myAppointments"
            element={
              <MyAppointments
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                userData={userData}
              />
            }
          />
          <Route
            path="myRecords"
            element={
              <MyRecords
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                userData={userData}
              />
            }
          />

          <Route
            path="adminAI"
            element={
              <AdminAi
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                userData={userData}
              />
            }
          />

          <Route path="/update/:id" element={<Update />} />
        </Routes>
      </div>

      {/* ✅ Floating chatbot added here */}
      <ChatbotPopup userRole={userRole} userId={userData?._id} />
    </div>
  );
};

export default Layout;
