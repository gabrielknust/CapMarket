import { Router } from "express";
import {
  createCart,
  getCartByUserId,
  addProductToCart,
  removeProductFromCart,
  clearCart,
} from "../controllers/cart.controller";

const router = Router();

router.post("/", createCart);
router.post("/user/:userId/items", addProductToCart);
router.get("/user/:userId", getCartByUserId);
router.delete("/user/:userId/items/:productId", removeProductFromCart);
router.delete("/user/:userId", clearCart);

export default router;
