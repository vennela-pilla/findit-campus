import api from "./api";
import { Item } from "../types/Item";

export interface ItemSearchParams {
  search?: string;
  type?: string;
  category?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface ReportItemPayload {
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  additionalDetails?: string;
  type: "lost" | "found";
  image?: File | null;
}

const buildFormData = (payload: ReportItemPayload) => {
  const form = new FormData();
  form.append("title", payload.title);
  form.append("category", payload.category);
  form.append("description", payload.description);
  form.append("location", payload.location);
  form.append("date", payload.date);
  form.append("type", payload.type);
  if (payload.additionalDetails) form.append("additionalDetails", payload.additionalDetails);
  if (payload.image) form.append("image", payload.image);
  return form;
};

export const createItem = async (payload: ReportItemPayload) => {
  const { data } = await api.post<{ success: boolean; message: string; data: { item: Item } }>(
    "/items",
    buildFormData(payload),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
};

export const searchItems = async (params: ItemSearchParams) => {
  const { data } = await api.get<{
    success: boolean;
    message: string;
    data: { items: Item[]; total: number; page: number; pages: number };
  }>("/items", { params });
  return data.data;
};

export const getMyItems = async () => {
  const { data } = await api.get<{ success: boolean; message: string; data: { items: Item[] } }>(
    "/items/my"
  );
  return data.data.items;
};

export const getItemById = async (id: string) => {
  const { data } = await api.get<{ success: boolean; message: string; data: { item: Item } }>(
    `/items/${id}`
  );
  return data.data.item;
};

export const deleteItem = async (id: string) => {
  const { data } = await api.delete<{ success: boolean; message: string }>(`/items/${id}`);
  return data;
};
