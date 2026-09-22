import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { sendError } from "../utils/apiResponse";

// Must run AFTER authMiddleware, since it relies on req.user being set.
// Backend authorization is mandatory here — the frontend route guard is
// only a UX convenience and is never trusted on its own.
const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin") {
    return sendError(res, "Not authorized, admin access required", 403);
  }
  next();
};

export default adminMiddleware;
