import { Response } from "express";
import mongoose from "mongoose";
import Claim from "../models/Claim";
import Item from "../models/Item";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { AuthRequest } from "../types";

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// POST /api/claims
export const createClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId, message } = req.body;

    if (!itemId || !isValidObjectId(itemId)) {
      return sendError(res, "Valid item ID is required", 400);
    }
    if (!message || message.trim().length < 10) {
      return sendError(res, "Please explain why you believe this item is yours (min 10 characters)", 400);
    }

    const item = await Item.findById(itemId);
    if (!item) return sendError(res, "Item not found", 404);

    if (item.status !== "approved") {
      return sendError(res, "This item is not available for claims", 400);
    }

    if (item.reportedBy.toString() === req.user!._id.toString()) {
      return sendError(res, "You cannot claim an item you reported yourself", 400);
    }

    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user!._id,
      status: "pending",
    });
    if (existingClaim) {
      return sendError(res, "You already have an active claim for this item", 400);
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user!._id,
      message: message.trim(),
      status: "pending",
    });

    return sendSuccess(res, "Claim submitted successfully. Awaiting admin review.", { claim }, 201);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to submit claim", 500);
  }
};

// GET /api/claims/my
export const getMyClaims = async (req: AuthRequest, res: Response) => {
  try {
    const claims = await Claim.find({ claimant: req.user!._id })
      .sort({ createdAt: -1 })
      .populate("item", "title imageUrl type status category location");
    return sendSuccess(res, "Your claims fetched successfully", { claims });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch your claims", 500);
  }
};

// GET /api/claims/:id
export const getClaimById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, "Invalid claim ID", 400);

    const claim = await Claim.findById(id)
      .populate("item")
      .populate("claimant", "fullName email");
    if (!claim) return sendError(res, "Claim not found", 404);

    const isOwner = claim.claimant._id.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === "admin";
    if (!isOwner && !isAdmin) {
      return sendError(res, "Not authorized to view this claim", 403);
    }

    return sendSuccess(res, "Claim fetched successfully", { claim });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch claim", 500);
  }
};
