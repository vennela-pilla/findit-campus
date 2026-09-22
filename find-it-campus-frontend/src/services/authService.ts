import api from "./api";
import { User } from "../types/User";

interface AuthResponse {
  user: User;
  token: string;
}

export const registerUser = async (payload: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const { data } = await api.post<{ success: boolean; message: string; data: AuthResponse }>(
    "/auth/register",
    payload
  );
  return data.data;
};

export const loginUser = async (payload: { email: string; password: string }) => {
  const { data } = await api.post<{ success: boolean; message: string; data: AuthResponse }>(
    "/auth/login",
    payload
  );
  return data.data;
};

export const fetchCurrentUser = async () => {
  const { data } = await api.get<{ success: boolean; message: string; data: { user: User } }>(
    "/auth/me"
  );
  return data.data.user;
};
