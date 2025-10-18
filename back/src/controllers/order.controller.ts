import { Request, Response } from "express";
import Order from "../models/order.model";
import User from "../models/user.model";
import Cart from "../models/cart.model";
import Product from "../models/product.model";
import { AuthenticatedRequest } from "../middleware/login.middleware";

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: "Erro de validação." });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    const cart = await Cart.findOne({ customer: userId }).populate({
      path: "items.product",
      model: "Product",
    });
    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ message: "Carrinho vazio ou não encontrado." });
    }

    const orderProducts = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Produto com ID ${item.product} não encontrado.`);
        }
        return {
          productId: product._id,
          name: product.name,
          unitaryPrice: product.price,
          quantity: item.quantity,
        };
      }),
    );

    const totalOrder = orderProducts.reduce(
      (total: number, item) => total + item.unitaryPrice * item.quantity,
      0,
    );

    const newOrder = new Order({
      customer: userId,
      products: orderProducts,
      totalOrder,
      status: "Pendente",
      address: shippingAddress,
    });

    const savedOrder = await newOrder.save();
    await Cart.updateOne({ customer: userId }, { items: [] });

    res.status(201).json(savedOrder);
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
    res.status(500).json({ message: "Erro ao criar pedido", error: message });
  }
};

export const getOrdersByToken = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const orders = await Order.find({ customer: userId })
      .populate("customer")
      .populate("products.productId");
    res.status(200).json(orders);
  } catch (error: Error | any) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res
      .status(500)
      .json({ message: "Erro ao buscar pedidos do usuário", error: message });
  }
};

export const getOrderById = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("customer")
      .populate("products.productId");
    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }
    res.status(200).json(order);
  } catch (error: Error | any) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res.status(500).json({ message: "Erro ao buscar pedido", error: message });
  }
};

export const getOrdersByUserId = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const orders = await Order.find({ customer: userId })
      .populate("customer")
      .populate("products.productId");
    res.status(200).json(orders);
  } catch (error: Error | any) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res
      .status(500)
      .json({ message: "Erro ao buscar pedidos do usuário", error: message });
  }
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    )
      .populate("customer")
      .populate("products.productId");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    res.status(200).json(updatedOrder);
  } catch (error: Error | any) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res
      .status(500)
      .json({ message: "Erro ao atualizar status do pedido", error: message });
  }
};

export const deleteOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );
    if (!deletedOrder) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }
    res
      .status(200)
      .json({ message: "Pedido deletado com sucesso.", order: deletedOrder });
  } catch (error: Error | any) {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    res.status(500).json({ message: "Erro ao deletar pedido", error: message });
  }
};
