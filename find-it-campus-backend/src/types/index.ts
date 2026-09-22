import { Request } from "express";
import { Document, Types } from "mongoose";

export type UserRole = "student" | "admin";

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

export type ItemType = "lost" | "found";
export type ItemStatus = "pending" | "approved" | "rejected" | "claimed";

export interface IItem extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  type: ItemType;
  location: string;
  date: Date;
  imageUrl?: string;
  imagePublicId?: string;
  additionalDetails?: string;
  status: ItemStatus;
  rejectionReason?: string;
  reportedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ClaimStatus = "pending" | "approved" | "rejected";

export interface IClaim extends Document {
  _id: Types.ObjectId;
  item: Types.ObjectId;
  claimant: Types.ObjectId;
  message: string;
  status: ClaimStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Extends Express's Request so authenticated user info can be attached
// by the auth middleware and read by any downstream handler.
export interface AuthRequest extends Request {
  user?: IUser;
}

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
