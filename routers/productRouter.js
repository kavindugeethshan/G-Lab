import express from "express";
import { createProduct, createManyProducts, getallProducts, getProductById, updateProduct, deleteProduct } from "../Controllers/productController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import { adminMiddleware } from "../Middleware/adminMiddleware.js";

const productRouter = express.Router();

// Public routes
productRouter.get("/", getallProducts);
productRouter.get("/:id", getProductById);

// Protected Admin routes
productRouter.post("/create", authMiddleware, adminMiddleware, createProduct);
productRouter.post("/bulk", authMiddleware, adminMiddleware, createManyProducts);
productRouter.put("/update/:id", authMiddleware, adminMiddleware, updateProduct);
productRouter.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default productRouter;