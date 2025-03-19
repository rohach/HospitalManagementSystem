import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api/v1";

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
    console.error("API Error:", error.response?.data || error.message);
    throw error;
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
    console.error("API Error:", error.response?.data || error.message);
    throw error;
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
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
};
