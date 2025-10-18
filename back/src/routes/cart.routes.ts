import { Router } from "express";
import {
  getCartByUserId,
  addProductToCart,
  removeProductFromCart,
  clearCart,
} from "../controllers/cart.controller";
import { authMiddleware } from "../middleware/login.middleware";

const router = Router();

router.post("/", authMiddleware, addProductToCart);
router.get("/", authMiddleware, getCartByUserId);
router.delete("/:productId", authMiddleware, removeProductFromCart);
router.delete("/", authMiddleware, clearCart);

export default router;
