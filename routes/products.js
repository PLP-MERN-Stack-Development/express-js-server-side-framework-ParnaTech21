import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getStats
} from "../controllers/productController.js";
import auth from "../middleware/auth.js";
import validateProduct from "../middleware/validateProduct.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/stats", getStats);
router.get("/:id", getProductById);
router.post("/", auth, validateProduct, createProduct);
router.put("/:id", auth, validateProduct, updateProduct);
router.delete("/:id", auth, deleteProduct);

export default router;
