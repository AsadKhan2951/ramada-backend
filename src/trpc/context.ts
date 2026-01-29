import { inferAsyncReturnType } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { verifyToken, JWTPayload } from "../auth/jwt.js";

export interface Context {
  user: JWTPayload | null;
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
}

export async function createContext({ req, res }: CreateExpressContextOptions): Promise<Context> {
  // Get token from Authorization header or cookie
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.token;
  
  let token: string | undefined;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (cookieToken) {
    token = cookieToken;
  }
  
  let user: JWTPayload | null = null;
  
  if (token) {
    user = verifyToken(token);
  }
  
  return {
    user,
    req,
    res,
  };
}

export type ContextType = inferAsyncReturnType<typeof createContext>;
