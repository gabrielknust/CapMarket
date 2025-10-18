import type { Request, Response } from "express";
import Product from "../models/product.model";
import User from "../models/user.model";
import { AuthenticatedRequest } from "../middleware/login.middleware";
import csv from "csv-parser";
import { Readable } from "stream";

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const seller = req.user?.id;
    const { name, price, description, urlImage } = req.body;

    const sellerExists = await User.findById(seller);
    if (!sellerExists) {
      return res
        .status(400)
        .json({ message: "Vendedor inválido ou não encontrado." });
    } else if (sellerExists.role !== "Vendedor") {
      return res.status(403).json({
        message: "Apenas usuários com papel de Vendedor podem criar produtos.",
      });
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

export const getAllProducts = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
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

export const getProductById = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
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

export const getProductsBySeller = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
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

export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
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
export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
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

export const uploadProductsFromCSV = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user?.id;
  if (req.user?.papel !== "Vendedor") {
    return res.status(403).json({
      message:
        "Acesso negado. Apenas vendedores podem fazer upload de produtos.",
    });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Nenhum arquivo CSV enviado." });
  }

  const productsToInsert: any[] = [];
  const errors: string[] = [];
  let rowCounter = 1;

  const readableFileStream = Readable.from(req.file.buffer);

  readableFileStream
    .pipe(csv())
    .on("data", (row) => {
      const { nome, preco, descricao, urlImagem } = row;

      if (!nome || !preco || !descricao || !urlImagem) {
        errors.push(
          `Linha ${rowCounter}: Campos obrigatórios (nome, preco, descricao, urlImagem) estão faltando.`,
        );
      } else if (isNaN(parseFloat(preco))) {
        errors.push(
          `Linha ${rowCounter}: O preço "${preco}" não é um número válido.`,
        );
      } else {
        productsToInsert.push({
          name: nome,
          price: parseFloat(preco),
          description: descricao,
          urlImage: urlImagem,
          seller: userId,
          isActive: true,
        });
      }
      rowCounter++;
    })
    .on("end", async () => {
      if (productsToInsert.length > 0) {
        try {
          await Product.insertMany(productsToInsert);
        } catch (dbError: Error | any) {
          return res.status(500).json({
            message: "Ocorreu um erro no banco de dados durante a inserção.",
            databaseError: dbError.message,
          });
        }
      }

      res.status(200).json({
        message: "Processamento do CSV concluído.",
        produtosCriados: productsToInsert.length,
        errosEncontrados: errors.length,
        detalhesDosErros: errors,
      });
    })
    .on("error", (err) => {
      res
        .status(500)
        .json({ message: "Erro ao ler o arquivo CSV.", error: err.message });
    });
};
