import { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/common/navbar/navbar";
import Login from "./components/common/auth/login";
import Layout from "./layout";
import { Routes, Route } from "react-router-dom";
import Doctors from "./components/common/Doctors/Doctors";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in by looking for a token in localStorage
  const loginStatus = () => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    loginStatus();
  }, []);

  return (
    <>
      {!isLoggedIn ? (
        <Login />
      ) : (
        <>
          <Navbar />
          <Routes>
            {/* <Route path="doctors" element={<Doctors />} /> */}
          </Routes>
        </>
      )}
    </>
  );
}

export default App;
