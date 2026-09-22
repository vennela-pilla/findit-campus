import { Router } from "express";
import { createClaim, getMyClaims, getClaimById } from "../controllers/claimController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware); // every claim route requires login

router.post("/", createClaim);
router.get("/my", getMyClaims);
router.get("/:id", getClaimById);

export default router;
