import { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/common/navbar/navbar";
import Login from "./components/common/auth/login";
import Layout from "./layout";
import { Routes, Route } from "react-router-dom";
import Doctors from "./components/common/Doctors/Doctors";
import Register from "./components/common/auth/register";
import NotFound from "./components/pages/NotFound";
import { notify } from "./components/pages/ToastMessage";
import { fetchData } from "./utils/api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState([]);

  // Check if the user is logged in by looking for a token in localStorage
  const loginStatus = () => {
    try {
      const token = localStorage.getItem("authToken");
      const user = localStorage.getItem("user");
      const userData = JSON.parse(user) ? JSON.parse(user) : null;

      if (userData) {
        setUserData(userData);
        const userId = userData.id;
        if (userId) {
          const getUserDetail = async (userId) => {
            try {
              const data = await fetchData(`auth/user/${userId}`, "GET", null, {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              });
              setUserData(data.user);
            } catch (error) {
              console.error("Failed to fetch user details:", error);
            }
          };

          getUserDetail(userId);
        } else {
          console.log("Error: userId is missing");
        }
      } else {
        console.log("Error: No user data found in localStorage");
      }

      setIsLoggedIn(!!token);
    } catch (error) {
      notify("Error!", "error");
    }
  };

  // Set user role based on localStorage
  const checkUserRole = () => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      // Assign -1 if the role is not admin or doctor (Patient)
      if (parsedUser.role === "admin") {
        setUserRole(1);
        // 1 for admin
      } else if (parsedUser.role === "doctor") {
        setUserRole(0);
        // 0 for doctor
      } else {
        setUserRole(-1); // Default for other users
      }
    } else {
      setUserRole(-1); // Default when no user data is found
    }
  };

  useEffect(() => {
    loginStatus();
    checkUserRole();
  }, []);

  return (
    <>
      {!isLoggedIn ? (
        <>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </>
      ) : (
        <>
          <Navbar
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            userData={userData}
          />
          <Routes>
            {/* Pass userRole as a prop to other components if needed */}
            {/* <Route
              path="/doctors"
              element={<Doctors isLoggedIn={isLoggedIn} userRole={userRole} />}
            /> */}
          </Routes>
        </>
      )}
    </>
  );
}

export default App;
