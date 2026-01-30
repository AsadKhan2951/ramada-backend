import { Request, Response } from 'express';
import { verifyToken, JWTPayload } from '../auth/jwt';

export interface Context {
  req: Request;
  res: Response;
  user: JWTPayload | null;
}

export function createContext({ req, res }: { req: Request; res: Response }): Context {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  const user = token ? verifyToken(token) : null;
  
  return {
    req,
    res,
    user,
  };
}
