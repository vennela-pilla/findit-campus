import { Item } from "./Item";

export type ClaimStatus = "pending" | "approved" | "rejected";

export interface Claimant {
  _id: string;
  fullName: string;
  email?: string;
}

export interface Claim {
  _id: string;
  item: Item | string;
  claimant: Claimant | string;
  message: string;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
}
