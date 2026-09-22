import { Response } from "express";
import User from "../models/User";
import generateToken from "../utils/generateToken";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { AuthRequest } from "../types";
import { Request } from "express";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// Strips sensitive fields before sending a user back to the client.
const sanitizeUser = (user: any) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return sendError(res, "All fields are required", 400);
    }

    if (fullName.trim().length < 2) {
      return sendError(res, "Full name must be at least 2 characters", 400);
    }

    if (!EMAIL_REGEX.test(email)) {
      return sendError(res, "Please provide a valid email address", 400);
    }

    if (password.length < 6) {
      return sendError(res, "Password must be at least 6 characters", 400);
    }

    if (password !== confirmPassword) {
      return sendError(res, "Passwords do not match", 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, "An account with this email already exists", 400);
    }

    // Public registration can never set role — it is always "student".
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "student",
    });

    const token = generateToken(user._id.toString());

    return sendSuccess(
      res,
      "Registration successful",
      { user: sanitizeUser(user), token },
      201
    );
  } catch (error: any) {
    return sendError(res, error.message || "Registration failed", 500);
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Email and password are required", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return sendError(res, "Invalid email or password", 401);
    }

    if (!user.isActive) {
      return sendError(res, "This account has been deactivated", 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, "Invalid email or password", 401);
    }

    const token = generateToken(user._id.toString());

    return sendSuccess(res, "Login successful", {
      user: sanitizeUser(user),
      token,
    });
  } catch (error: any) {
    return sendError(res, error.message || "Login failed", 500);
  }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, "Not authorized", 401);
  }
  return sendSuccess(res, "Current user fetched", { user: sanitizeUser(req.user) });
};
