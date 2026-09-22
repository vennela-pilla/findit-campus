export type ItemType = "lost" | "found";
export type ItemStatus = "pending" | "approved" | "rejected" | "claimed";

export const ITEM_CATEGORIES = [
  "Electronics",
  "Documents",
  "Accessories",
  "Books",
  "Clothing",
  "Bags",
  "Keys",
  "Other",
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export interface ReportedBy {
  _id: string;
  fullName: string;
  email?: string;
}

export interface Item {
  _id: string;
  title: string;
  description: string;
  category: string;
  type: ItemType;
  location: string;
  date: string;
  imageUrl?: string;
  imagePublicId?: string;
  additionalDetails?: string;
  status: ItemStatus;
  rejectionReason?: string;
  reportedBy: ReportedBy | string;
  createdAt: string;
  updatedAt: string;
}
