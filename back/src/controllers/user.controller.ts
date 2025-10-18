import type { Request, Response } from "express";
import User from "../models/user.model";
import Cart from "../models/cart.model";
import { AuthenticatedRequest } from "../middleware/login.middleware";
import Product from "../models/product.model";

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Este email já está em uso." });
    }

    const newUser = new User({ name, email, password, role });
    await newUser.save();
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    res.status(201).json(userResponse);
  } catch (error: Error | any) {
    if (error.name === "ValidationError") {
      const errors: Record<string, string> = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ message: "Erro de validação.", errors });
    }
    const message =
      error instanceof Error ? error.message : "Erro desconhecido.";
    res.status(500).json({ message: "Erro ao criar usuário", error: message });
  }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res
      .status(500)
      .json({ message: "Erro ao buscar usuários", error: message });
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    res.status(200).json(user);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res.status(500).json({ message: "Erro ao buscar usuário", error: message });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    res.status(200).json(updatedUser);
  } catch (error: Error | any) {
    if (error.name === "ValidationError") {
      const errors: Record<string, string> = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ message: "Erro de validação.", errors });
    }
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res
      .status(500)
      .json({ message: "Erro ao atualizar usuário", error: message });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndUpdate(id, { isActive: false });

    if (deletedUser?.role === "Vendedor") {
      await Product.updateMany(
        { seller: deletedUser._id },
        { isActive: false },
      );
    }

    if (!deletedUser) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    res.status(200).json({ message: "Usuário deletado com sucesso." });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res
      .status(500)
      .json({ message: "Erro ao deletar usuário", error: message });
  }
};
