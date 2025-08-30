import React, { useEffect, useState } from "react";
import { fetchData, updateData, deleteData } from "../../../utils/api";
import "./notification.css";

const Notifications = ({ userData }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = userData?.role?.toLowerCase();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      if (!role) return;

      let endpoint = "";
      if (role === "admin") {
        endpoint = "notification/admin";
      } else if (role === "patient") {
        endpoint = `notification/patient/${userData._id}`;
      } else if (role === "doctor") {
        endpoint = `notification/doctor/${userData._id}`;
      }

      const res = await fetchData(endpoint);
      if (res?.success) setNotifications(res.notifications || []);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?._id) loadNotifications();
  }, [userData]);

  const markAsRead = async (id) => {
    try {
      const endpoint =
        role === "admin"
          ? `notification/admin/mark-as-read/${id}`
          : `notification/${role}/mark-as-read/${id}`; // use notification id, not userId
      const res = await updateData(endpoint, {});
      if (res?.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === id ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const endpoint =
        role === "admin"
          ? "notification/admin/mark-all-as-read"
          : `notification/${role}/mark-all-as-read/${userData._id}`;
      const res = await updateData(endpoint, {});
      if (res?.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
      }
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?"))
      return;

    try {
      const res = await deleteData(`notification/admin/${id}`);
      if (res?.success) {
        setNotifications((prev) => prev.filter((notif) => notif._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  if (loading) return <p className="loading-text">Loading notifications...</p>;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>
          <i className="fa-solid fa-bell icon-bell"></i>{" "}
          {role === "admin" ? "All Notifications" : "Your Notifications"}
        </h2>
        {notifications.length > 0 && (
          <i
            className="fa-solid fa-check icon-mark-all"
            title="Mark all as read"
            onClick={markAllAsRead}
          ></i>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="no-notifications">No notifications found.</p>
      ) : (
        <ul className="notifications-list">
          {notifications.map((notif) => (
            <li
              key={notif._id}
              className={`notification-item ${
                notif.isRead ? "read" : "unread"
              }`}
            >
              <div className="notification-content">
                <h4 className="notification-type">{notif.type}</h4>
                <p className="notification-message">{notif.message}</p>
                <span className="notification-time">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="notification-actions">
                {!notif.isRead && (
                  <i
                    className="fa-solid fa-check icon-action read-icon"
                    title="Mark as read"
                    onClick={() => markAsRead(notif._id)}
                  ></i>
                )}
                {role === "admin" && (
                  <i
                    className="fa-solid fa-trash icon-action delete-icon"
                    title="Delete notification"
                    onClick={() => handleDelete(notif._id)}
                  ></i>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
