import { Router } from "express";
import {
  createOrder,
  getOrderById,
  getOrdersByToken,
  getOrdersByUserId,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller";
import { authMiddleware } from "../middleware/login.middleware";

const router = Router();

router.post("/", authMiddleware, createOrder);
router.get("/user/", authMiddleware, getOrdersByToken);
router.get("/user/:userId", authMiddleware, getOrdersByUserId);
router.put("/status/:id", authMiddleware, updateOrderStatus);
router.get("/:id", authMiddleware, getOrderById);
router.delete("/:id", authMiddleware, deleteOrder);

export default router;
