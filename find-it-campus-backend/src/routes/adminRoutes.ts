import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/adminMiddleware";
import {
  getDashboardStats,
  getPendingItems,
  getApprovedItems,
  getRejectedItems,
  approveItem,
  rejectItem,
  getAllClaims,
  approveClaim,
  rejectClaim,
  getAllUsers,
  getUserReports,
  getUserClaims,
  toggleUserActive,
} from "../controllers/adminController";

const router = Router();

// Every admin route requires a valid, authenticated admin — enforced on
// the backend regardless of what the frontend's AdminRoute guard shows.
router.use(authMiddleware, adminMiddleware);

router.get("/dashboard", getDashboardStats);

router.get("/items/pending", getPendingItems);
router.get("/items/approved", getApprovedItems);
router.get("/items/rejected", getRejectedItems);
router.patch("/items/:id/approve", approveItem);
router.patch("/items/:id/reject", rejectItem);

router.get("/claims", getAllClaims);
router.patch("/claims/:id/approve", approveClaim);
router.patch("/claims/:id/reject", rejectClaim);

router.get("/users", getAllUsers);
router.get("/users/:id/reports", getUserReports);
router.get("/users/:id/claims", getUserClaims);
router.patch("/users/:id/toggle-active", toggleUserActive);

export default router;
