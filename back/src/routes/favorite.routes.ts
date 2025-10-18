import { Router } from "express";
import {
  addFavorite,
  removeFavorite,
  listUserFavorites,
} from "../controllers/favorite.controller";
import { authMiddleware } from "../middleware/login.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", listUserFavorites);

router.post("/", addFavorite);

router.delete("/:productId", removeFavorite);

export default router;
