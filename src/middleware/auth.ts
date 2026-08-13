import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AuthService from '../services/authService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'super_admin' | 'celebrity' | 'fan';
  };
}

/**
 * Middleware: Extract and verify JWT token from Authorization header
 */
export const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware: Require super_admin role
 */
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
};

/**
 * Middleware: Require celebrity role
 */
export const requireCelebrity = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'celebrity' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ error: 'Celebrity access required' });
  }
  next();
};

/**
 * Middleware: Require fan role
 */
export const requireFan = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'fan') {
    return res.status(403).json({ error: 'Fan access required' });
  }
  next();
};

/**
 * Middleware: Require authenticated user (any role)
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

export default verifyToken;
