import type { Request, Response } from "express";
import Product from "../models/product.model";
import Cart from "../models/cart.model";
import { AuthenticatedRequest } from "../middleware/login.middleware";

export const getCartByUserId = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "products.product",
      model: "Product",
    });
    if (!cart) {
      return res.status(404).json({ message: "Carrinho não encontrado." });
    }
    res.status(200).json(cart);
  } catch (error: Error | any) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res
      .status(500)
      .json({ message: "Erro ao buscar carrinho", error: message });
  }
};

export const addProductToCart = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Carrinho não encontrado." });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(400).json({ message: "Produto não encontrado." });
    }

    const productInCart = cart.items.find(
      (item) => item.product!.toString() === productId,
    );
    if (productInCart) {
      productInCart.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    const updatedCart = await cart.save();
    res.status(200).json(updatedCart);
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
    res.status(500).json({
      message: "Erro ao adicionar produto ao carrinho",
      error: message,
    });
  }
};

export const removeProductFromCart = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Carrinho não encontrado." });
    }

    const productIndex = cart.items.findIndex(
      (item) => item.product!.toString() === productId,
    );
    if (productIndex === -1) {
      return res
        .status(400)
        .json({ message: "Produto não encontrado no carrinho." });
    }

    cart.items.splice(productIndex, 1);
    const updatedCart = await cart.save();
    res.status(200).json(updatedCart);
  } catch (error: Error | any) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res.status(500).json({
      message: "Erro ao remover produto do carrinho",
      error: message,
    });
  }
};

export const clearCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Carrinho não encontrado." });
    }

    cart.items = [];
    const updatedCart = await cart.save();
    res.status(200).json(updatedCart);
  } catch (error: Error | any) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res
      .status(500)
      .json({ message: "Erro ao limpar carrinho", error: message });
  }
};
