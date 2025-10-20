import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsBySeller,
  updateProduct,
  deleteProduct,
  uploadProductsFromCSV,
} from "../controllers/product.controller";
import { authMiddleware } from "../middleware/login.middleware";
import upload from "../config/multer.config";

const router = Router();

router.post("/", authMiddleware, createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get("/seller/:sellerId", authMiddleware, getProductsBySeller);
router.patch("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);
router.post(
  "/upload",
  authMiddleware,
  upload.single("products-csv"),
  uploadProductsFromCSV,
);

export default router;
