import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchData, updateData } from "../../../utils/api";
import Loading from "../../pages/Loading";
import Error from "../../pages/Error";

const Update = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    patientCaste: "",
    gender: "",
    age: "",
    contact: "",
    wardName: "",
    status: "",
    email: "",
    address: "",
    doctor: "", // Adding the doctor field
  });
  const [doctors, setDoctors] = useState([]); // To store the list of doctors
  const [wards, setWards] = useState([]); // To store the list of wards

  useEffect(() => {
    const getPatient = async () => {
      try {
        const data = await fetchData(`patient/getSinglePatient/${id}`);
        if (data && data.patientDetail) {
          setPatient(data.patientDetail);
          setFormData({
            patientName: data.patientDetail.patientName,
            patientCaste: data.patientDetail.patientCaste,
            gender: data.patientDetail.gender,
            age: data.patientDetail.age,
            contact: data.patientDetail.contact,
            wardName: data.patientDetail.ward?._id || "", // Make sure this is the correct reference (_id)
            status: data.patientDetail.status,
            email: data.patientDetail.email || "",
            address: data.patientDetail.address || "",
            doctor: data.patientDetail.doctors[0]?._id || "", // Assuming the patient can have multiple doctors, take the first one by default
          });
        } else {
          setError(true);
        }
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const getDoctors = async () => {
      try {
        const doctorData = await fetchData("doctor/getAllDoctors"); // Adjust this endpoint as per your API
        setDoctors(doctorData?.doctors || []);
      } catch (error) {
        setError(true);
      }
    };

    const getWards = async () => {
      try {
        const wardData = await fetchData("ward/getAllWards"); // Adjust this endpoint as per your API
        setWards(wardData?.wards || []);
      } catch (error) {
        setError(true);
      }
    };

    getPatient();
    getDoctors();
    getWards();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Ensure the doctor field is passed as an array even if it's just one
    const updatedFormData = {
      ...formData,
      doctor: [formData.doctor], // Ensures doctor is an array
    };

    // Log the formData to check the values before sending
    console.log("Form Data to be submitted: ", updatedFormData);

    // Check that the selected doctor and wardName are valid
    if (!updatedFormData.doctor || updatedFormData.doctor.length === 0) {
      console.log("Error: No doctor selected.");
      setError(true);
      setLoading(false);
      return;
    }

    if (!updatedFormData.wardName) {
      console.log("Error: No ward selected.");
      setError(true);
      setLoading(false);
      return;
    }

    try {
      const response = await updateData(
        `patient/getSinglePatient/${id}`,
        updatedFormData
      );
      console.log("Patient updated successfully!", response);

      navigate("/"); // Navigate after successful update
    } catch (error) {
      console.log("Error updating patient:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error />;
  }

  return (
    <div className="popup">
      <div className="ppcontainer">
        <div className="form-part">
          <div className="form_title">
            <h2>Edit Patient</h2>
            <i
              className="fa-solid fa-xmark"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/")} // Close the popup by navigating away
            ></i>
          </div>
          <form className="form-inputs" onSubmit={handleSubmit}>
            <div className="text-input">
              <label htmlFor="patientName">First Name</label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="text-input">
              <label htmlFor="patientCaste">Last Name</label>
              <input
                type="text"
                name="patientCaste"
                value={formData.patientCaste}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="text-input">
              <label htmlFor="contact">Mobile/Landline</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="text-input">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="text-input">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="text-input">
              <label htmlFor="age">Age</label>
              <input
                type="text"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="text-input">
              <label htmlFor="gender">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="text-input">
              <label htmlFor="status">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Status</option>
                <option value="Admitted">Admitted</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>
            <div className="text-input">
              <label htmlFor="ward">Ward</label>
              <select
                name="wardName"
                value={formData.wardName}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Ward</option>
                {wards.map((ward) => (
                  <option key={ward._id} value={ward._id}>
                    {ward.wardName}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-input">
              <label htmlFor="doctor">Doctor</label>
              <select
                name="doctor"
                value={formData.doctor}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name} - {doctor.grade}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="add_doctor"
              type="submit"
              style={{ width: "100%" }}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Update;
