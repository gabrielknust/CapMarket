import { Router } from "express";

import {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsBySeller,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";

const router = Router();

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get("/seller/:sellerId", getProductsBySeller);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
