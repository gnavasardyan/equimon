import bcrypt from 'bcryptjs';
import session from 'express-session';
import { storage } from './storage';
import type { User, UserRegistration, UserLogin } from '@shared/schema';
import type { Request, Response, NextFunction } from 'express';

// Session configuration
const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 days

export function createSession() {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error('SESSION_SECRET environment variable is required');
  }

  return session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Authentication functions
export async function registerUser(userData: UserRegistration): Promise<User> {
  const { email, firstName, lastName, password, companyId, newCompanyName, role } = userData;

  // Check if user already exists
  const existingUser = await storage.getUserByEmail(email);
  if (existingUser) {
    throw new Error('Пользователь с этим email уже существует');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Handle company creation or selection
  let finalCompanyId = companyId;
  if (newCompanyName && !companyId) {
    const newCompany = await storage.createCompany({
      name: newCompanyName,
      licenseType: 'basic',
      maxStations: 10,
      isActive: true
    });
    finalCompanyId = newCompany.id;
  }

  if (!finalCompanyId) {
    throw new Error('Необходимо выбрать компанию или создать новую');
  }

  // Create user
  const user = await storage.createUser({
    email,
    firstName,
    lastName,
    passwordHash,
    role,
    companyId: finalCompanyId,
    isActive: true
  });

  return user;
}

export async function loginUser(credentials: UserLogin): Promise<User> {
  const { email, password } = credentials;

  // Find user by email
  const user = await storage.getUserByEmail(email);
  if (!user) {
    throw new Error('Неверный email или пароль');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Аккаунт деактивирован');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Неверный email или пароль');
  }

  return user;
}

// Middleware
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Необходима авторизация' });
    }

    const user = await storage.getUser(userId);
    if (!user || !user.isActive) {
      req.session.destroy((err) => {});
      return res.status(401).json({ message: 'Сессия недействительна' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Role-based authorization
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Необходима авторизация' });
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Недостаточно прав доступа' });
    }

    next();
  };
};

// Session declarations for TypeScript
declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}