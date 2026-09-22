import api from "./api";
import { Claim } from "../types/Claim";

export const createClaim = async (itemId: string, message: string) => {
  const { data } = await api.post<{ success: boolean; message: string; data: { claim: Claim } }>(
    "/claims",
    { itemId, message }
  );
  return data;
};

export const getMyClaims = async () => {
  const { data } = await api.get<{ success: boolean; message: string; data: { claims: Claim[] } }>(
    "/claims/my"
  );
  return data.data.claims;
};

export const getClaimById = async (id: string) => {
  const { data } = await api.get<{ success: boolean; message: string; data: { claim: Claim } }>(
    `/claims/${id}`
  );
  return data.data.claim;
};
