import jwt from "jsonwebtoken";

// Signs a JWT containing the user's id. The token is verified later
// in authMiddleware to identify the requesting user.
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign({ id: userId }, secret, { expiresIn } as jwt.SignOptions);
};

export default generateToken;
