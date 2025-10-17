import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";
import User from "../models/user.model";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    papel: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Acesso negado. Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as {
      id: string;
      papel: string;
    };

    const freshUser = await User.findById(decoded.id);

    if (!freshUser) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    if (!freshUser.isActive) {
      return res
        .status(403)
        .json({ message: "Usuário desativado. Acesso proibido." });
    }

    req.user = decoded;

    next();
  } catch (error) {
    res.status(403).json({ message: "Token inválido ou expirado." });
  }
};
