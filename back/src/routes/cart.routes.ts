import { Router } from "express";
import {
  getCartByUserId,
  addProductToCart,
  removeProductFromCart,
  clearCart,
} from "../controllers/cart.controller";
import { authMiddleware } from "../middleware/login.middleware";

const router = Router();

router.post("/user/:userId/items", authMiddleware, addProductToCart);
router.get("/user/:userId", authMiddleware, getCartByUserId);
router.delete(
  "/user/:userId/items/:productId",
  authMiddleware,
  removeProductFromCart,
);
router.delete("/user/:userId", authMiddleware, clearCart);

export default router;
