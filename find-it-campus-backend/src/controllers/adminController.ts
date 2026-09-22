import { Response } from "express";
import mongoose from "mongoose";
import Item from "../models/Item";
import Claim from "../models/Claim";
import User from "../models/User";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { AuthRequest } from "../types";

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// GET /api/admin/dashboard
export const getDashboardStats = async (_req: AuthRequest, res: Response) => {
  try {
    const [totalItems, pendingItems, approvedItems, rejectedItems, pendingClaims, totalUsers] =
      await Promise.all([
        Item.countDocuments(),
        Item.countDocuments({ status: "pending" }),
        Item.countDocuments({ status: "approved" }),
        Item.countDocuments({ status: "rejected" }),
        Claim.countDocuments({ status: "pending" }),
        User.countDocuments(),
      ]);

    return sendSuccess(res, "Dashboard stats fetched", {
      totalItems,
      pendingItems,
      approvedItems,
      rejectedItems,
      pendingClaims,
      totalUsers,
    });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch dashboard stats", 500);
  }
};

// GET /api/admin/items/pending | approved | rejected
const getItemsByStatus = (status: "pending" | "approved" | "rejected") =>
  async (_req: AuthRequest, res: Response) => {
    try {
      const items = await Item.find({ status }).sort({ createdAt: -1 }).populate(
        "reportedBy",
        "fullName email"
      );
      return sendSuccess(res, `${status} items fetched successfully`, { items });
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch items", 500);
    }
  };

export const getPendingItems = getItemsByStatus("pending");
export const getApprovedItems = getItemsByStatus("approved");
export const getRejectedItems = getItemsByStatus("rejected");

// PATCH /api/admin/items/:id/approve
export const approveItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, "Invalid item ID", 400);

    const item = await Item.findById(id);
    if (!item) return sendError(res, "Item not found", 404);

    item.status = "approved";
    item.rejectionReason = undefined;
    await item.save();

    return sendSuccess(res, "Item approved successfully", { item });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to approve item", 500);
  }
};

// PATCH /api/admin/items/:id/reject
export const rejectItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!isValidObjectId(id)) return sendError(res, "Invalid item ID", 400);

    const item = await Item.findById(id);
    if (!item) return sendError(res, "Item not found", 404);

    item.status = "rejected";
    item.rejectionReason = reason?.trim() || "Did not meet platform guidelines";
    await item.save();

    return sendSuccess(res, "Item rejected successfully", { item });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to reject item", 500);
  }
};

// GET /api/admin/claims
export const getAllClaims = async (_req: AuthRequest, res: Response) => {
  try {
    const claims = await Claim.find()
      .sort({ createdAt: -1 })
      .populate("item", "title imageUrl type status")
      .populate("claimant", "fullName email");
    return sendSuccess(res, "Claims fetched successfully", { claims });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch claims", 500);
  }
};

// PATCH /api/admin/claims/:id/approve
// Approving a claim marks the item as claimed and auto-rejects any other
// pending claims on the same item, so conflicting claims can't both win.
export const approveClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, "Invalid claim ID", 400);

    const claim = await Claim.findById(id);
    if (!claim) return sendError(res, "Claim not found", 404);

    if (claim.status !== "pending") {
      return sendError(res, "This claim has already been reviewed", 400);
    }

    const item = await Item.findById(claim.item);
    if (!item) return sendError(res, "Associated item not found", 404);

    claim.status = "approved";
    await claim.save();

    item.status = "claimed";
    await item.save();

    await Claim.updateMany(
      { item: item._id, _id: { $ne: claim._id }, status: "pending" },
      { status: "rejected" }
    );

    return sendSuccess(res, "Claim approved successfully", { claim });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to approve claim", 500);
  }
};

// PATCH /api/admin/claims/:id/reject
export const rejectClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, "Invalid claim ID", 400);

    const claim = await Claim.findById(id);
    if (!claim) return sendError(res, "Claim not found", 404);

    if (claim.status !== "pending") {
      return sendError(res, "This claim has already been reviewed", 400);
    }

    claim.status = "rejected";
    await claim.save();

    return sendSuccess(res, "Claim rejected successfully", { claim });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to reject claim", 500);
  }
};

// GET /api/admin/users
export const getAllUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return sendSuccess(res, "Users fetched successfully", { users });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch users", 500);
  }
};

// GET /api/admin/users/:id/reports
export const getUserReports = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, "Invalid user ID", 400);
    const items = await Item.find({ reportedBy: id }).sort({ createdAt: -1 });
    return sendSuccess(res, "User reports fetched successfully", { items });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch user reports", 500);
  }
};

// GET /api/admin/users/:id/claims
export const getUserClaims = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, "Invalid user ID", 400);
    const claims = await Claim.find({ claimant: id })
      .sort({ createdAt: -1 })
      .populate("item", "title imageUrl");
    return sendSuccess(res, "User claims fetched successfully", { claims });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch user claims", 500);
  }
};

// PATCH /api/admin/users/:id/toggle-active
export const toggleUserActive = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, "Invalid user ID", 400);

    if (id === req.user!._id.toString()) {
      return sendError(res, "You cannot deactivate your own account", 400);
    }

    const user = await User.findById(id);
    if (!user) return sendError(res, "User not found", 404);

    user.isActive = !user.isActive;
    await user.save();

    return sendSuccess(res, `User ${user.isActive ? "activated" : "deactivated"} successfully`, {
      user,
    });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to update user", 500);
  }
};
