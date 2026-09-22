import api from "./api";
import { Item } from "../types/Item";
import { Claim } from "../types/Claim";
import { User } from "../types/User";

export interface DashboardStats {
  totalItems: number;
  pendingItems: number;
  approvedItems: number;
  rejectedItems: number;
  pendingClaims: number;
  totalUsers: number;
}

export const getDashboardStats = async () => {
  const { data } = await api.get<{ success: boolean; message: string; data: DashboardStats }>(
    "/admin/dashboard"
  );
  return data.data;
};

const getItemsByStatus = async (status: "pending" | "approved" | "rejected") => {
  const { data } = await api.get<{ success: boolean; message: string; data: { items: Item[] } }>(
    `/admin/items/${status}`
  );
  return data.data.items;
};

export const getPendingItems = () => getItemsByStatus("pending");
export const getApprovedItems = () => getItemsByStatus("approved");
export const getRejectedItems = () => getItemsByStatus("rejected");

export const approveItem = async (id: string) => {
  const { data } = await api.patch<{ success: boolean; message: string; data: { item: Item } }>(
    `/admin/items/${id}/approve`
  );
  return data;
};

export const rejectItem = async (id: string, reason?: string) => {
  const { data } = await api.patch<{ success: boolean; message: string; data: { item: Item } }>(
    `/admin/items/${id}/reject`,
    { reason }
  );
  return data;
};

export const getAllClaims = async () => {
  const { data } = await api.get<{ success: boolean; message: string; data: { claims: Claim[] } }>(
    "/admin/claims"
  );
  return data.data.claims;
};

export const approveClaim = async (id: string) => {
  const { data } = await api.patch<{ success: boolean; message: string }>(
    `/admin/claims/${id}/approve`
  );
  return data;
};

export const rejectClaim = async (id: string) => {
  const { data } = await api.patch<{ success: boolean; message: string }>(
    `/admin/claims/${id}/reject`
  );
  return data;
};

export const getAllUsers = async () => {
  const { data } = await api.get<{ success: boolean; message: string; data: { users: User[] } }>(
    "/admin/users"
  );
  return data.data.users;
};

export const getUserReports = async (id: string) => {
  const { data } = await api.get<{ success: boolean; message: string; data: { items: Item[] } }>(
    `/admin/users/${id}/reports`
  );
  return data.data.items;
};

export const getUserClaims = async (id: string) => {
  const { data } = await api.get<{ success: boolean; message: string; data: { claims: Claim[] } }>(
    `/admin/users/${id}/claims`
  );
  return data.data.claims;
};

export const toggleUserActive = async (id: string) => {
  const { data } = await api.patch<{ success: boolean; message: string; data: { user: User } }>(
    `/admin/users/${id}/toggle-active`
  );
  return data;
};
