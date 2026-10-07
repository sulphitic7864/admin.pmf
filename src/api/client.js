import axios from "axios";

export const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL.replace(/\/+$/, ""),
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getApiErrorMessage = (error) => {
  const responseMessage =
    error?.response?.data?.message || error?.response?.data?.error;
  if (responseMessage) return responseMessage;
  if (error?.code === "ECONNABORTED") return "The request timed out. Please try again.";
  if (!error?.response) return "Unable to reach the server. Check your connection and API URL.";
  return `Request failed (${error.response.status}). Please try again.`;
};

export const responseRows = (data, property) => {
  const rows = property ? data?.[property] : data?.result;
  if (Array.isArray(rows)) return rows;
  if (Array.isArray(data)) return data;
  return [];
};
