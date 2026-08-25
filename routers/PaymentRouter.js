import express from "express";
import { createPayment, getPaymentDetails } from "../Controllers/paymentController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";
const paymentRouter = express.Router();

paymentRouter.post("/create", authMiddleware, createPayment);
paymentRouter.get("/:id", authMiddleware, getPaymentDetails);

export default paymentRouter;