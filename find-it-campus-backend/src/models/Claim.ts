import { Schema, model } from "mongoose";
import { IClaim } from "../types";

const claimSchema = new Schema<IClaim>(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    claimant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Please explain why you believe this item is yours"],
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

claimSchema.index({ item: 1, claimant: 1 });

export default model<IClaim>("Claim", claimSchema);
