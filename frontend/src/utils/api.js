import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api/v1";

const handleApiError = (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.message;

  if (status === 401 || status === 403 || message?.includes("No User Found!")) {
    console.warn("Auth error detected, redirecting to login...");
    // window.location.href = "/";
  }

  console.error("API Error:", error.response?.data || error.message);
  throw error;
};

export const fetchData = async (
  endpoint,
  method = "GET",
  body = null,
  headers = {}
) => {
  try {
    const response = await axios({
      url: `${API_BASE_URL}/${endpoint}`,
      method,
      data: body,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteData = async (endpoint, headers = {}) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const postData = async (endpoint, body, headers = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${endpoint}`, body, {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateData = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errData = await response.json();
      if (
        response.status === 401 ||
        response.status === 403 ||
        errData?.message?.includes("No User Found!")
      ) {
        window.location.href = "/";
      }
      throw new Error(errData?.message || "Failed to update data");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch API Error:", error.message);
    throw error;
  }
};
