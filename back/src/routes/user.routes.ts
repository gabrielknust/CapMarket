import { Router } from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updatePassword,
} from "../controllers/user.controller";
import { authMiddleware } from "../middleware/login.middleware";

const router = Router();

router.post("/", createUser);
router.get("/", authMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUserById);
router.patch("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);
router.patch("/password/:id", authMiddleware, updatePassword);

export default router;
