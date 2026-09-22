import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../types";
import { sendError } from "../utils/apiResponse";

interface DecodedToken {
  id: string;
}

// Verifies the JWT from the Authorization header, loads the user from
// MongoDB, and attaches it to req.user for downstream handlers.
const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Not authorized, no token provided", 401);
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return sendError(res, "Server misconfiguration: missing JWT secret", 500);
    }

    const decoded = jwt.verify(token, secret) as DecodedToken;

    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, "Not authorized, user no longer exists", 401);
    }

    if (!user.isActive) {
      return sendError(res, "This account has been deactivated", 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, "Not authorized, invalid or expired token", 401);
  }
};

// Like authMiddleware, but does not reject the request when no/invalid
// token is present — it just leaves req.user undefined. Used on routes
// that behave differently for guests vs logged-in owners/admins
// (e.g. viewing a single item).
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return next();

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) return next();

    const decoded = jwt.verify(token, secret) as DecodedToken;
    const user = await User.findById(decoded.id);
    if (user && user.isActive) {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
};

export default authMiddleware;
