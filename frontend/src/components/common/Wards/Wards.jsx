import React, { useEffect, useState } from "react";
import "./wards.css";
import { fetchData, postData, deleteData } from "../../../utils/api";
import Loading from "../../pages/Loading";
import Error from "../../pages/Error";
import ToastifyComponent, { notify } from "../../pages/ToastMessage";
import defaultImage from "../../assets/default-ward.avif";

const Wards = ({ userRole }) => {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [wardData, setWardData] = useState({
    name: "",
    type: "",
    capacity: "",
    location: "",
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const wardsPerPage = 8;

  useEffect(() => {
    const getWards = async () => {
      try {
        const data = await fetchData("ward/getAllWards");
        setWards(data.wards);
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    getWards();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWardData({ ...wardData, [name]: value });
  };

  const addWard = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await postData("ward/registerWard", wardData);
      notify(response?.message, "success");
      setWards([...wards, response.ward]);
      setOpenPopup(false);
    } catch (error) {
      notify(error.response?.data?.message || "Failed to add ward", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteWard = async (wardId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this ward?"
    );
    if (!isConfirmed) return;
    setLoading(true);
    try {
      await deleteData(`ward/getSingleWard/${wardId}`);
      setWards(wards.filter((ward) => ward._id !== wardId));
      notify("Ward deleted successfully!", "success");
    } catch (error) {
      notify("Failed to delete ward", "error");
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const indexOfLastWard = currentPage * wardsPerPage;
  const indexOfFirstWard = indexOfLastWard - wardsPerPage;
  const currentWards = wards.slice(indexOfFirstWard, indexOfLastWard);
  const totalPages = Math.ceil(wards.length / wardsPerPage);

  const changePage = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error />;

  return (
    <div className="container wards">
      <ToastifyComponent />
      <div className="doctors_heading">
        <h2>View All Wards</h2>
        {userRole === 1 && (
          <button className="add_doctor" onClick={() => setOpenPopup(true)}>
            <i className="fa-solid fa-plus"></i> &nbsp; Add Ward
          </button>
        )}
      </div>

      {!openPopup && (
        <div>
          <div className="doctors_container">
            {currentWards.length > 0 ? (
              currentWards.map((ward) => (
                <div className="doctors_div" key={ward._id}>
                  <img
                    src={
                      ward?.image
                        ? `http://localhost:4000/${ward.image}`
                        : defaultImage
                    }
                    alt="Ward_Img"
                    style={{ borderRadius: "7px" }}
                  />
                  <p className="doc_name">{ward.wardName}</p>
                  <p className="grade">Type: {ward.wardType}</p>
                  <p className="grade">Capacity: {ward.capacity}</p>
                  <p className="grade">Occupied Beds: {ward.occupiedBeds}</p>
                  <button
                    className="action_button"
                    onClick={() => deleteWard(ward._id)}
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              ))
            ) : (
              <p>No Wards Found</p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <ul id="pagination">
              <li>
                <a
                  href="#"
                  onClick={() => changePage(currentPage - 1)}
                  className={currentPage === 1 ? "disabled" : ""}
                >
                  «
                </a>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i + 1}>
                  <a
                    href="#"
                    className={currentPage === i + 1 ? "active" : ""}
                    onClick={() => changePage(i + 1)}
                  >
                    {i + 1}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#"
                  onClick={() => changePage(currentPage + 1)}
                  className={currentPage === totalPages ? "disabled" : ""}
                >
                  »
                </a>
              </li>
            </ul>
          )}
        </div>
      )}

      {openPopup && (
        <div className="popup">
          <div className="ppcontainer">
            <div className="form-part">
              <div className="form_title">
                <h2>Add Ward</h2>
                <i
                  className="fa-solid fa-xmark"
                  style={{ cursor: "pointer" }}
                  onClick={() => setOpenPopup(false)}
                ></i>
              </div>
              <form className="form-inputs" onSubmit={addWard}>
                <div className="text-input">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={wardData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="text-input">
                  <label htmlFor="type">Type</label>
                  <input
                    type="text"
                    name="type"
                    value={wardData.type}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="text-input">
                  <label htmlFor="capacity">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={wardData.capacity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="text-input">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={wardData.location}
                    onChange={handleInputChange}
                    required
                  />
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
      )}
    </div>
  );
};

export default Wards;
