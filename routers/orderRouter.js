import express from "express";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import { createOrder, getMyOrders, getOrderById } from "../Controllers/OrderController.js";

const orderRouter = express.Router();

orderRouter.post("/", authMiddleware, createOrder);
orderRouter.get("/my-orders", authMiddleware, getMyOrders);
orderRouter.get("/:id", authMiddleware, getOrderById);

export default orderRouter;