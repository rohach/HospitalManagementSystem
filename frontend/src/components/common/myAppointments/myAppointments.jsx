import React, { useEffect, useState } from "react";
import axios from "axios";
import "./myAppointments.css";

const MyAppointments = ({ userData }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editAppointment, setEditAppointment] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const API_BASE_URL = "http://localhost:4000/api/v1";

  // Fetch logged-in patient's appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/appointment/appointments`, {
        params: { userId: userData._id, role: "patient" },
      });
      if (res.data) {
        setAppointments(res.data.appointments || []);
      }
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [userData._id]);
  console.log(appointments);
  // Delete appointment
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?"))
      return;

    try {
      await axios.delete(`${API_BASE_URL}/appointment/${id}`);
      alert("Appointment deleted successfully!");
      fetchAppointments();
    } catch (error) {
      console.error("Failed to delete appointment", error);
    }
  };

  // Open edit modal
  const handleEditClick = (appointment) => {
    setEditAppointment(appointment);
    setEditDate(appointment.date);
    setEditTime(appointment.time);
  };

  // Update appointment
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_BASE_URL}/appointment/${editAppointment._id}/status`,
        {
          date: editDate,
          time: editTime,
        }
      );
      alert("Appointment updated successfully!");
      setEditAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error("Failed to update appointment", error);
    }
  };

  if (loading) return <p>Loading your appointments...</p>;

  return (
    <div className="my-appointments-container">
      <h2>My Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Date</th>
              <th>Note</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment._id}>
                <td>Dr. {appointment.doctor.name || "N/A"}</td>
                <td>{appointment.appointmentDateTime}</td>
                <td>{appointment.notes}</td>
                <td>{appointment.status}</td>
                <td>
                  {/* <button
                    className="edit-btn"
                    onClick={() => handleEditClick(appointment)}
                  >
                    Edit
                  </button> */}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(appointment._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit Modal */}
      {editAppointment && (
        <div className="modal">
          <div className="modal-content">
            <span
              className="close-btn"
              onClick={() => setEditAppointment(null)}
            >
              &times;
            </span>
            <h3>Edit Appointment</h3>
            <form onSubmit={handleUpdate}>
              <label>
                Date:
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                />
              </label>
              <label>
                Time:
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  required
                />
              </label>
              <button type="submit" className="save-btn">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
