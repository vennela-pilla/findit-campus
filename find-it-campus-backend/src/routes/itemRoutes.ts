import { Router } from "express";
import {
  createItem,
  getItems,
  getMyItems,
  getItemById,
  updateItem,
  deleteItem,
} from "../controllers/itemController";
import authMiddleware, { optionalAuthMiddleware } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";

const router = Router();

// Public search (no auth required, only approved items are returned)
router.get("/", getItems);

// Authenticated routes — order matters: "/my" must come before "/:id"
router.get("/my", authMiddleware, getMyItems);
router.post("/", authMiddleware, upload.single("image"), createItem);
router.get("/:id", optionalAuthMiddleware, getItemById);
router.patch("/:id", authMiddleware, upload.single("image"), updateItem);
router.delete("/:id", authMiddleware, deleteItem);

export default router;
