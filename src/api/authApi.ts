// src/api/authApi.ts
import { apiClient } from "./client";

export type SignupRequest = {
  email: string;
  password: string;
  name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type User = {
  id?: number;
  email: string;
  name: string;
  // 서버가 내려주면 있을 수도 있으니 optional
  password?: string;
};

export type LoginResponse = {
  message: string; // "login_success"
  data: User;
};

export const authApi = {
  async signup(payload: SignupRequest) {
    const res = await apiClient.post<User>("/auth/signup", payload);
    return res.data;
  },

  async login(payload: LoginRequest) {
    const res = await apiClient.post<LoginResponse>("/auth/login", payload);
    return res.data;
  },
};
