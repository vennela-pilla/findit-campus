import { Response } from "express";
import mongoose from "mongoose";
import Item from "../models/Item";
import Claim from "../models/Claim";
import cloudinary from "../config/cloudinary";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { AuthRequest, ITEM_CATEGORIES } from "../types";

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// POST /api/items
// Creates either a lost or found report. type/status are always set by
// the server ("pending" + whatever type the route/body specifies), never
// trusted blindly from the client beyond the allowed enum values.
export const createItem = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, type, location, date, additionalDetails } =
      req.body;

    if (!title || !description || !category || !type || !location || !date) {
      return sendError(res, "Please fill in all required fields", 400);
    }

    if (!ITEM_CATEGORIES.includes(category)) {
      return sendError(res, "Invalid category", 400);
    }

    if (!["lost", "found"].includes(type)) {
      return sendError(res, "Invalid item type", 400);
    }

    const file = req.file as Express.Multer.File & {
      path?: string;
      filename?: string;
    };

    const item = await Item.create({
      title: title.trim(),
      description: description.trim(),
      category,
      type,
      location: location.trim(),
      date: new Date(date),
      additionalDetails: additionalDetails?.trim(),
      imageUrl: file?.path,
      imagePublicId: (file as any)?.filename,
      status: "pending",
      reportedBy: req.user!._id,
    });

    return sendSuccess(res, "Item reported successfully. Awaiting admin approval.", { item }, 201);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to create item", 500);
  }
};

// GET /api/items
// Public search — only approved items are ever returned here.
export const getItems = async (req: AuthRequest, res: Response) => {
  try {
    const { search, type, category, location, page = "1", limit = "12" } = req.query;

    const filter: Record<string, any> = { status: "approved" };

    if (search) {
      filter.$or = [
        { title: { $regex: search as string, $options: "i" } },
        { description: { $regex: search as string, $options: "i" } },
      ];
    }
    if (type && type !== "all") filter.type = type;
    if (category && category !== "all") filter.category = category;
    if (location) filter.location = { $regex: location as string, $options: "i" };

    const pageNum = Math.max(parseInt(page as string) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit as string) || 12, 1), 50);

    const [items, total] = await Promise.all([
      Item.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("reportedBy", "fullName"),
      Item.countDocuments(filter),
    ]);

    return sendSuccess(res, "Items fetched successfully", {
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch items", 500);
  }
};

// GET /api/items/my
export const getMyItems = async (req: AuthRequest, res: Response) => {
  try {
    const items = await Item.find({ reportedBy: req.user!._id }).sort({
      createdAt: -1,
    });
    return sendSuccess(res, "Your reports fetched successfully", { items });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch your reports", 500);
  }
};

// GET /api/items/:id
export const getItemById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, "Invalid item ID", 400);

    const item = await Item.findById(id).populate("reportedBy", "fullName email");
    if (!item) return sendError(res, "Item not found", 404);

    // Non-owners/non-admins may only view approved items.
    const isOwner = req.user && item.reportedBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user?.role === "admin";

    if (item.status !== "approved" && !isOwner && !isAdmin) {
      return sendError(res, "Item not found", 404);
    }

    return sendSuccess(res, "Item fetched successfully", { item });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch item", 500);
  }
};

// PATCH /api/items/:id
// Owner-only edit of a still-pending report.
export const updateItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, "Invalid item ID", 400);

    const item = await Item.findById(id);
    if (!item) return sendError(res, "Item not found", 404);

    if (item.reportedBy.toString() !== req.user!._id.toString()) {
      return sendError(res, "Not authorized to edit this item", 403);
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "location",
      "date",
      "additionalDetails",
    ];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        (item as any)[field] = req.body[field];
      }
    }

    const file = req.file as Express.Multer.File & { path?: string; filename?: string };
    if (file) {
      if (item.imagePublicId) {
        await cloudinary.uploader.destroy(item.imagePublicId).catch(() => null);
      }
      item.imageUrl = file.path;
      item.imagePublicId = (file as any).filename;
    }

    // Editing resets a rejected report back to pending for re-review.
    if (item.status === "rejected") {
      item.status = "pending";
      item.rejectionReason = undefined;
    }

    await item.save();
    return sendSuccess(res, "Item updated successfully", { item });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to update item", 500);
  }
};

// DELETE /api/items/:id
export const deleteItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, "Invalid item ID", 400);

    const item = await Item.findById(id);
    if (!item) return sendError(res, "Item not found", 404);

    const isOwner = item.reportedBy.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === "admin";
    if (!isOwner && !isAdmin) {
      return sendError(res, "Not authorized to delete this item", 403);
    }

    if (item.imagePublicId) {
      await cloudinary.uploader.destroy(item.imagePublicId).catch(() => null);
    }

    await Claim.deleteMany({ item: item._id });
    await item.deleteOne();

    return sendSuccess(res, "Item deleted successfully");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to delete item", 500);
  }
};
