import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/login.middleware";
import Favorite from "../models/favorite.model";
import Product from "../models/product.model";

export const addFavorite = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.body;

  try {
    const productExists = await Product.findOne({
      _id: productId,
      isActive: true,
    });
    if (!productExists) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    const favorite = await Favorite.create({
      user: userId,
      product: productId,
    });
    res
      .status(201)
      .json({ message: "Produto favoritado com sucesso.", favorite });
  } catch (error: any) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Este produto já está nos seus favoritos." });
    }
    res.status(500).json({ message: "Erro no servidor ao favoritar produto." });
  }
};

export const removeFavorite = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user!.id;
  const { productId } = req.params;

  try {
    const result = await Favorite.deleteOne({
      user: userId,
      product: productId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Favorito não encontrado." });
    }

    res
      .status(200)
      .json({ message: "Produto removido dos favoritos com sucesso." });
  } catch (error) {
    res.status(500).json({ message: "Erro no servidor ao remover favorito." });
  }
};

export const listUserFavorites = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user!.id;

  try {
    const favorites = await Favorite.find({ user: userId }).populate("product");

    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: "Erro no servidor ao listar favoritos." });
  }
};
