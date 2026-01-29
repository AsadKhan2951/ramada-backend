import { verifyToken } from "../auth/jwt";
export async function createContext({ req, res }) {
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
    let user = null;
    if (token) {
        user = verifyToken(token);
    }
    return {
        user,
        req,
        res,
    };
}
