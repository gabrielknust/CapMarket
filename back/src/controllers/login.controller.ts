import { Request, Response } from "express";
import User from "../models/user.model";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ email }).select("+senha +salt");

    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const isPasswordValid = user.comparePassword(senha);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const payload = {
      id: user._id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "8h",
    });

    res.status(200).json({ token });
  } catch (error) {
    req.log.error(error, "Erro no processo de login");
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res
      .status(500)
      .json({ message: "Erro no servidor durante o login", error: message });
  }
};
