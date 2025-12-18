import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://3.34.132.207:8080/api", // ← 절대주소 대신 /api 로만!
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
