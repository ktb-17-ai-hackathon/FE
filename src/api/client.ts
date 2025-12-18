import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api", // ← 절대주소 대신 /api 로만!
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
