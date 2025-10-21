import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/login.middleware';
import Product from '../models/product.model';
import Order from '../models/order.model';
import mongoose from 'mongoose';

export const getSellerDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user!.id);

    const totalProductsRegistered = await Product.countDocuments({ seller: sellerId });

    const dashboardDataAggregation = await Order.aggregate([
      { $match: { status: { $in: ["Pago", "Enviado", "Entregue"] } } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      { $match: { "productDetails.seller": sellerId } },
      {
        $group: {
          _id: "$products.productId",
          name: { $first: "$productDetails.name" },
          totalQuantitySold: { $sum: "$products.quantity" },
          totalRevenuePerProduct: { $sum: { $multiply: ["$productDetails.price", "$products.quantity"] } }
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $group: {
          _id: null,
          totalRevenue: { $sum: "$totalRevenuePerProduct" },
          totalProductsSold: { $sum: "$totalQuantitySold" },
          bestSellingProduct: { $first: { _id: "$_id", name: "$name", totalQuantitySold: "$totalQuantitySold" } }
        }
      }
    ]);

    const dashboardData = {
      totalProductsRegistered,
      totalRevenue: dashboardDataAggregation[0]?.totalRevenue || 0,
      totalProductsSold: dashboardDataAggregation[0]?.totalProductsSold || 0,
      bestSellingProduct: dashboardDataAggregation[0]?.bestSellingProduct || null
    };

    res.status(200).json(dashboardData);

  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar dados do dashboard." });
  }
};