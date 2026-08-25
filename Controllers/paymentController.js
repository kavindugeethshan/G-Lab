import mongoose from "mongoose";
import Order from "../models/Ordermodel.js";
import Payment from "../models/Paymentmodel.js";
import { generatePayHereHash } from "../utils/payhere.js";


export const createPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        // 1. Validate orderId
        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required",
            });
        }

        // 2. Get authenticated user
        const userId = req.user.userId;

        // 3. Find order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        // 4. Check order ownership
        if (order.User.toString() !== userId.toString()) {
            return res.status(403).json({
                message: "You are not allowed to pay for this order",
            });
        }

        // 5. Check order status
        if (order.Orderstatus !== "Pending") {
            return res.status(400).json({
                message: "This order cannot be paid",
            });
        }

        // 6. Check existing active payment
        const existingPayment = await Payment.findOne({
            Order: order._id,
            status: {
                $in: ["Pending", "Processing", "Paid"],
            },
        });

        if (existingPayment) {
            return res.status(400).json({
                message: "Payment already exists for this order",
                paymentId: existingPayment._id,
                status: existingPayment.status,
            });
        }

        // 7. Create payment using backend order total
        const payment = await Payment.create({
            Order: order._id,
            User: order.User,
            amount: order.FinalTotal,
            currency: "LKR",
            method: "Card",
            gateway: "PayHere",
            status: "Pending",
        });

        // Generate PayHere hash
        const hash = generatePayHereHash(
            process.env.PAYHERE_MERCHANT_ID,
            payment.Order.toString(),
            payment.amount,
            payment.currency,
            process.env.PAYHERE_MERCHANT_SECRET
        );

        // 8. Link payment to order
        order.paymentId = payment._id;
        order.paymentStatus = "Pending";
        order.paymentMethod = "Card";

        await order.save();

        // 9. Return safe response
        return res.status(201).json({
            message: "Payment created successfully",
            payment: {
                id: payment._id,
                orderId: payment.Order,
                amount: payment.amount,
                currency: payment.currency,
                method: payment.method,
                gateway: payment.gateway,
                status: payment.status,
                merchantId: process.env.PAYHERE_MERCHANT_ID,
                hash: hash,
            },
        });

    } catch (error) {
        console.error("Create payment error:", error);

        return res.status(500).json({
            message: "Failed to create payment",
        });
    }
};

export const getPaymentDetails = async (req, res) => {
    try {
        const paymentId = req.params.paymentId || req.params.id;
        const userId = req.user.userId;

        // 1. Validate paymentId format
        if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
            return res.status(400).json({ message: "Invalid payment ID format" });
        }

        // 2. Find payment and populate Order and User
        const payment = await Payment.findById(paymentId)
            .populate("Order")
            .populate("User", "firstname lastname email address");

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // 3. Verify payment ownership
        const paymentUserId = payment.User._id ? payment.User._id.toString() : payment.User.toString();
        if (paymentUserId !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized access to payment" });
        }

        const order = payment.Order;
        if (!order) {
            return res.status(404).json({ message: "Associated order not found" });
        }

        // 4. Generate PayHere hash for checkout (backend only)
        const hash = generatePayHereHash(
            process.env.PAYHERE_MERCHANT_ID,
            order._id.toString(),
            payment.amount,
            payment.currency,
            process.env.PAYHERE_MERCHANT_SECRET
        );

        // 5. Return safe payment object
        return res.status(200).json({
            message: "Payment details retrieved successfully",
            payment: {
                id: payment._id,
                orderId: order._id,
                amount: payment.amount,
                currency: payment.currency,
                method: payment.method,
                gateway: payment.gateway,
                status: payment.status,
                merchantId: process.env.PAYHERE_MERCHANT_ID,
                hash: hash,
                customer: {
                    first_name: payment.User.firstname || "Customer",
                    last_name: payment.User.lastname || "User",
                    email: payment.User.email || "customer@example.com",
                    phone: "0771234567",
                    address: order.Diliveryaddress?.addressLine || "Main Street",
                    city: order.Diliveryaddress?.city || "Colombo",
                    country: "Sri Lanka",
                }
            }
        });
    } catch (error) {
        console.error("Get payment details error:", error);
        return res.status(500).json({ message: "Failed to fetch payment details" });
    }
};

