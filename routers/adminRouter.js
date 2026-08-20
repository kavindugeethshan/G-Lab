import express from "express";
import { adminDashboard, updateOrderStatus } from "../Controllers/adminController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import { adminMiddleware } from "../Middleware/adminMiddleware.js";
import { createProduct, createManyProducts, updateProduct, deleteProduct } from "../Controllers/productcontroller.js";

const adminRouter = express.Router();

adminRouter.get("/dashboard", authMiddleware, adminMiddleware, adminDashboard);
adminRouter.post("/products/create", authMiddleware, adminMiddleware, createProduct);
adminRouter.post("/products/bulk", authMiddleware, adminMiddleware, createManyProducts);
adminRouter.put("/products/update/:id", authMiddleware, adminMiddleware, updateProduct);
adminRouter.delete("/products/:id", authMiddleware, adminMiddleware, deleteProduct);
adminRouter.patch("/orders/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

export default adminRouter;