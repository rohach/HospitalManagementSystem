<<<<<<< HEAD
import "./App.css";
import Layout from "./layout";

function App() {
  return (
    <>
      <Layout />
=======
import { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/common/navbar/navbar";
import Layout from "./layout";
import Login from "./components/common/auth/login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in by looking for a token in localStorage
  const loginStatus = () => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token); // set isLoggedIn to true if token exists, otherwise false
  };

  useEffect(() => {
    loginStatus(); // Check login status on initial render
  }, []);

  // Conditionally render Login or Navbar + Layout based on isLoggedIn
  return (
    <>
      {!isLoggedIn ? (
        <Login /> // Show Login page if not logged in
      ) : (
        <>
          <Navbar />
        </>
      )}
>>>>>>> cd162b2 (Backend and Frontend updated)
    </>
  );
}

export default App;
