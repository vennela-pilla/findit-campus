import { Schema, model } from "mongoose";
import { IItem, ITEM_CATEGORIES } from "../types";

const itemSchema = new Schema<IItem>(
  {
    title: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ITEM_CATEGORIES,
    },
    type: {
      type: String,
      required: true,
      enum: ["lost", "found"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: 150,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    imageUrl: {
      type: String,
    },
    imagePublicId: {
      type: String,
    },
    additionalDetails: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "claimed"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Supports the search page: text index over name/description, plus
// common filter fields for fast equality lookups.
itemSchema.index({ title: "text", description: "text" });
itemSchema.index({ status: 1, type: 1, category: 1 });

export default model<IItem>("Item", itemSchema);
