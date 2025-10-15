import type { Request, Response } from "express";
import Product from "../models/product.model";
import User from "../models/user.model";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, description, urlImage, seller } = req.body;

    const sellerExists = await User.findById(seller);
    if (!sellerExists || sellerExists.role !== "Vendedor") {
      return res
        .status(400)
        .json({ message: "Vendedor inválido ou não encontrado." });
    }

    const newProduct = new Product({
      name,
      price,
      description,
      urlImage,
      seller,
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
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
    res.status(500).json({ message: "Erro ao criar produto", error: message });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isActive: true }).populate(
      "seller",
      "name email",
    );
    res.status(200).json(products);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res
      .status(500)
      .json({ message: "Erro ao buscar produtos", error: message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ _id: id, isActive: true }).populate(
      "seller",
      "name email",
    );

    if (!product) {
      return res
        .status(404)
        .json({ message: "Produto não encontrado ou inativo." });
    }

    res.status(200).json(product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res.status(500).json({ message: "Erro ao buscar produto", error: message });
  }
};

export const getProductsBySeller = async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;

    const sellerExists = await User.findById(sellerId);
    if (!sellerExists || sellerExists.role !== "Vendedor") {
      return res
        .status(400)
        .json({ message: "Vendedor inválido ou não encontrado." });
    }

    const products = await Product.find({
      seller: sellerId,
      isActive: true,
    }).populate("seller", "name email");

    res.status(200).json(products);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res
      .status(500)
      .json({ message: "Erro ao buscar produtos do vendedor", error: message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    res.status(200).json(updatedProduct);
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
      .json({ message: "Erro ao atualizar produto", error: message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deactivatedProduct = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!deactivatedProduct) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    res.status(200).json({
      message: "Produto desativado com sucesso.",
      product: deactivatedProduct,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res
      .status(500)
      .json({ message: "Erro ao desativar produto", error: message });
  }
};
