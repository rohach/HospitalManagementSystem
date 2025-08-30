import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./appointments.css";
import {
  fetchData,
  postData,
  updateData,
  deleteData,
} from "../../../utils/api";

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(new Date());

  const [newAppointment, setNewAppointment] = useState({
    patient: "",
    doctor: "",
    appointmentDate: new Date(),
    appointmentTime: "09:00",
    notes: "",
  });

  // Fetch all appointments
  const getAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetchData("appointment/appointments");
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch patients and doctors
  const getPatientsAndDoctors = async () => {
    try {
      const patientsRes = await fetchData("patient/getAllPatients");
      const doctorsRes = await fetchData("doctor/getAllDoctors");
      setPatients(patientsRes.patients || []);
      setDoctors(doctorsRes.doctors || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getAppointments();
    getPatientsAndDoctors();
  }, []);

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    const [hours, minutes] = newAppointment.appointmentTime.split(":");
    const appointmentDateTime = new Date(newAppointment.appointmentDate);
    appointmentDateTime.setHours(hours, minutes);

    try {
      await postData("appointment/createAppointment", {
        ...newAppointment,
        appointmentDateTime,
      });
      setNewAppointment({
        patient: "",
        doctor: "",
        appointmentDate: new Date(),
        appointmentTime: "09:00",
        notes: "",
      });
      await getAppointments(); // Refetch to get populated patient/doctor names
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, status, newDateTime = null) => {
    try {
      const payload = { status };
      if (newDateTime) payload.newDateTime = newDateTime;
      await updateData(`appointment/${id}/status`, payload);
      await getAppointments(); // Refetch after update to get updated names/status
      setRescheduleId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?"))
      return;
    try {
      await deleteData(`appointment/${id}`);
      await getAppointments(); // Refetch after delete
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading appointments...</p>;

  return (
    <div className="appointment-container">
      {/* Add Appointment Form */}
      <form className="add-appointment-form" onSubmit={handleAddAppointment}>
        <h3>Add New Appointment</h3>

        <select
          value={newAppointment.patient}
          onChange={(e) =>
            setNewAppointment({ ...newAppointment, patient: e.target.value })
          }
          required
        >
          <option value="">Select Patient</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>
              {p.patientName}
            </option>
          ))}
        </select>

        <select
          value={newAppointment.doctor}
          onChange={(e) =>
            setNewAppointment({ ...newAppointment, doctor: e.target.value })
          }
          required
        >
          <option value="">Select Doctor</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

        <input
          type="time"
          value={newAppointment.appointmentTime}
          onChange={(e) =>
            setNewAppointment({
              ...newAppointment,
              appointmentTime: e.target.value,
            })
          }
          required
        />

        <DatePicker
          selected={newAppointment.appointmentDate}
          onChange={(date) =>
            setNewAppointment({ ...newAppointment, appointmentDate: date })
          }
          className="date-picker"
          required
        />

        <input
          type="text"
          placeholder="Notes"
          value={newAppointment.notes}
          onChange={(e) =>
            setNewAppointment({ ...newAppointment, notes: e.target.value })
          }
        />

        <button type="submit" className="btn-add">
          Add Appointment
        </button>
      </form>

      {/* Appointments Table */}
      <table className="appointment-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt._id}>
              <td>{appt.patient?.patientName || "N/A"}</td>
              <td>Dr. {appt.doctor?.name || "N/A"}</td>
              <td>{new Date(appt.appointmentDateTime).toLocaleString()}</td>
              <td>
                <span className={`status-badge ${appt.status}`}>
                  {appt.status}
                </span>
              </td>
              <td>{appt.notes}</td>
              <td>
                {appt.status !== "approved" && (
                  <button
                    className="btn-approve"
                    onClick={() => handleUpdateStatus(appt._id, "approved")}
                  >
                    Approve
                  </button>
                )}

                {appt.status !== "rejected" && (
                  <button
                    className="btn-reject"
                    onClick={() => handleUpdateStatus(appt._id, "rejected")}
                  >
                    Reject
                  </button>
                )}

                {rescheduleId === appt._id ? (
                  <div className="reschedule-inline">
                    <DatePicker
                      selected={rescheduleDate}
                      onChange={(date) => setRescheduleDate(date)}
                      showTimeSelect
                      dateFormat="Pp"
                      className="reschedule-datepicker"
                    />
                    <button
                      className="btn-save"
                      onClick={() =>
                        handleUpdateStatus(
                          appt._id,
                          "rescheduled",
                          rescheduleDate
                        )
                      }
                    >
                      Save
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => setRescheduleId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-reschedule"
                    onClick={() => {
                      setRescheduleId(appt._id);
                      setRescheduleDate(new Date(appt.appointmentDateTime));
                    }}
                  >
                    Reschedule
                  </button>
                )}

                <button
                  className="btn-delete"
                  onClick={() => handleDelete(appt._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentList;
