import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
const JWT_SECRET = process.env.JWT_SECRET || "ramada-bms-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";
// Generate JWT token
export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
// Verify JWT token
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
}
// Hash password
export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}
// Compare password with hash
export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}
// Express middleware for JWT authentication
export function authMiddleware(req, res, next) {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
    }
    else if (cookieToken) {
        token = cookieToken;
    }
    if (!token) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }
    const payload = verifyToken(token);
    if (!payload) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }
    req.user = payload;
    next();
}
// Optional auth middleware (doesn't fail if no token)
export function optionalAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
    }
    else if (cookieToken) {
        token = cookieToken;
    }
    if (token) {
        const payload = verifyToken(token);
        if (payload) {
            req.user = payload;
        }
    }
    next();
}
// Check if user has full access
export function requireFullAccess(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }
    if (req.user.accessLevel !== "full") {
        res.status(403).json({ error: "Full access required for this operation" });
        return;
    }
    next();
}
