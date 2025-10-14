import type { Request, Response } from "express";
import User from "../models/user.model.ts";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, papel } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Este email já está em uso." });
    }

    const newUser = new User({ nome, email, senha, papel });
    await newUser.save();
    const userResponse = {
      _id: newUser._id,
      nome: newUser.nome,
      email: newUser.email,
      papel: newUser.papel,
    };

    res.status(201).json(userResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido.";
    res.status(500).json({ message: "Erro ao criar usuário", error: message });
  }
};

export const getAllUsers = async (res: Response) => {
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

export const getUserById = async (req: Request, res: Response) => {
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

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.senha) delete updates.senha;

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res
      .status(500)
      .json({ message: "Erro ao atualizar usuário", error: message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

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
