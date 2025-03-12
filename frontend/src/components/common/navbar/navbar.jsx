import React from "react";
import "./navbar.css";
import logo from "../../assets/logo.png";

const Navbar = () => {
  return (
    <section className="sidebar">
      <div className="header">
        <a href="#">
          <span className="focus">M</span>
          <span className="unfocus">
            ed<span style={{ color: "var(--blue)" }}>Ex</span>
          </span>
        </a>
      </div>
      <div className="separator-wrapper">
        <hr className="separator" />
        <label for="minimize" className="minimize-btn">
          <input type="checkbox" id="minimize" />
          <i className="fa-solid fa-angle-left"></i>
        </label>
      </div>
      <div className="navigation">
        <div className="section main-section">
          <ul className="items">
            <li className="item">
              <a href="#">
                <i className="fa-solid fa-house"></i>
                <span className="item-text">Dashboard</span>
                <span className="item-tooltip">Dashboard</span>
              </a>
            </li>
            <li className="item">
              <a href="#">
                <i className="fa-solid fa-calendar-days"></i>
                <span className="item-text">Appointments</span>
                <span className="item-tooltip">Appointments</span>
              </a>
            </li>
            <li className="item">
              <a href="#">
                <i className="fa-solid fa-user-doctor"></i>
                <span className="item-text">Doctors</span>
                <span className="item-tooltip">Doctors</span>
              </a>
            </li>
            <li className="item">
              <a href="#">
                <i className="fa-solid fa-users"></i>
                <span className="item-text">Patients</span>
                <span className="item-tooltip">Patients</span>
              </a>
            </li>
            <li className="item">
              <a href="#">
                <i className="fa-solid fa-bed"></i>
                <span className="item-text">Wards</span>
                <span className="item-tooltip">Wards</span>
              </a>
            </li>
            <li className="item">
              <a href="#">
                <i className="fa-solid fa-file-medical"></i>
                <span className="item-text">Records</span>
                <span className="item-tooltip">Records</span>
              </a>
            </li>
            <li className="item">
              <a href="#">
                <i className="fa-solid fa-clipboard"></i>
                <span className="item-text">Treatments</span>
                <span className="item-tooltip">Treatments</span>
              </a>
            </li>
          </ul>
        </div>
        <div className="section settings-section">
          <ul className="items">
            <li className="item">
              <a href="#">
                <i className="fa-solid fa-bell"></i>
                <span className="item-text">Notifications</span>
                <span className="item-tooltip">Notifications</span>
              </a>
            </li>
            <li className="item">
              <a href="#">
                <i className="fa-solid fa-gear"></i>
                <span className="item-text">Settings</span>
                <span className="item-tooltip">Settings</span>
              </a>
            </li>
            <li className="item">
              <a href="#">
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                <span className="item-text">Logout</span>
                <span className="item-tooltip">Logout</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Navbar;
