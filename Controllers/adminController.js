import mongoose from "mongoose";
import Order from "../models/Ordermodel.js";
import User from "../models/Usermodel.js";
import Product from "../models/Productmodel.js";

// Admin Dashboard
export const adminDashboard = async (req, res) => {
    try {
        return res.status(200).json({
            message: "Welcome to Admin Dashboard",
            admin: req.user,
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Update Order Status - Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate Order ID
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid order ID",
            });
        }

        // Allowed statuses
        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Shipped",
            "Delivered",
            "Cancelled",
        ];

        // Validate status
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid or missing order status",
                allowedStatuses,
            });
        }

        // Find order
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        // Allowed status transitions
        const allowedTransitions = {
            Pending: ["Confirmed", "Cancelled"],
            Confirmed: ["Shipped", "Cancelled"],
            Shipped: ["Delivered"],
            Delivered: [],
            Cancelled: [],
        };

        const currentStatus = order.Orderstatus;

        // Prevent duplicate record if status is unchanged
        if (currentStatus === status) {
            return res.status(400).json({
                message: `Order is already in ${status} status`,
            });
        }

        // Validate transition
        if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(status)) {
            return res.status(400).json({
                message: `Cannot change order status from ${currentStatus} to ${status}`,
            });
        }

        // --------------------------------------------------
        // STOCK DEDUCTION (Pending -> Confirmed)
        // --------------------------------------------------
        if (status === "Confirmed") {
            // Check stock for every product first
            for (const item of order.Products) {
                const product = await Product.findById(item.productId);

                if (!product) {
                    return res.status(404).json({
                        message: `Product not found: ${item.productId}`,
                    });
                }

                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        message: `Not enough stock for ${product.name}`,
                    });
                }
            }

            // Deduct stock
            for (const item of order.Products) {
                const product = await Product.findById(item.productId);
                product.stock -= item.quantity;
                product.isavailable = product.stock > 0;
                await product.save();
            }
        }

        // --------------------------------------------------
        // STOCK RESTORATION (Confirmed -> Cancelled by Admin)
        // --------------------------------------------------
        if (status === "Cancelled" && currentStatus === "Confirmed") {
            for (const item of order.Products) {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.stock += item.quantity;
                    product.isavailable = product.stock > 0;
                    await product.save();
                }
            }
        }

        // Update order status and append to statusHistory
        order.Orderstatus = status;

        if (!order.statusHistory) {
            order.statusHistory = [];
        }

        order.statusHistory.push({
            status: status,
            changedAt: new Date(),
        });

        await order.save();

        return res.status(200).json({
            message: "Order status updated successfully",
            order,
        });

    } catch (error) {
        console.log("Update order status error:", error.message);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// View all orders - Admin
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("User", "firstname lastname email")
            .populate("Products.productId", "name price brand image")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "All orders fetched successfully",
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// View Order Details - Admin
export const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid order ID",
            });
        }

        const order = await Order.findById(id)
            .populate("User", "firstname lastname email address")
            .populate("Products.productId", "name price brand category image");

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        return res.status(200).json({
            message: "Order details fetched successfully",
            order,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Search Orders by orderId, userId, or email - Admin
export const searchOrders = async (req, res) => {
    try {
        const { orderId, userId, email } = req.query;

        if (!orderId && !userId && !email) {
            return res.status(400).json({
                message: "Please provide at least one search parameter (orderId, userId, or email)",
            });
        }

        if (orderId) {
            if (!mongoose.Types.ObjectId.isValid(orderId)) {
                return res.status(400).json({
                    message: "Invalid order ID format",
                });
            }

            const order = await Order.findById(orderId)
                .populate("User", "firstname lastname email")
                .populate("Products.productId", "name price brand");

            if (!order) {
                return res.status(404).json({
                    message: "Order not found",
                });
            }

            return res.status(200).json({
                message: "Order found",
                count: 1,
                orders: [order],
            });
        }

        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    message: "Invalid user ID format",
                });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            const orders = await Order.find({ User: user._id })
                .populate("User", "firstname lastname email")
                .populate("Products.productId", "name price brand")
                .sort({ createdAt: -1 });

            return res.status(200).json({
                message: "Orders found for user ID",
                count: orders.length,
                orders,
            });
        }

        if (email) {
            const cleanEmail = email.trim().toLowerCase();
            const user = await User.findOne({ email: cleanEmail });
            if (!user) {
                return res.status(404).json({
                    message: "User not found with provided email",
                });
            }

            const orders = await Order.find({ User: user._id })
                .populate("User", "firstname lastname email")
                .populate("Products.productId", "name price brand")
                .sort({ createdAt: -1 });

            return res.status(200).json({
                message: "Orders found for email",
                count: orders.length,
                orders,
            });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Filter Orders by Status - Admin
export const filterOrders = async (req, res) => {
    try {
        const { status } = req.query;

        if (!status) {
            return res.status(400).json({
                message: "Order status parameter is required",
            });
        }

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Shipped",
            "Delivered",
            "Cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status filter",
                allowedStatuses,
            });
        }

        const orders = await Order.find({ Orderstatus: status })
            .populate("User", "email firstname lastname")
            .populate("Products.productId", "name price brand")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Orders filtered successfully",
            status,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// View All Users - Admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });

        return res.status(200).json({
            message: "All users fetched successfully",
            count: users.length,
            users,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// View User Details - Admin
export const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid user ID",
            });
        }

        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "User details fetched successfully",
            user,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Block User - Admin
export const blockUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid user ID",
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Prevent blocking admin users
        if (user.isadmin) {
            return res.status(403).json({
                message: "Admin users cannot be blocked",
            });
        }

        user.isblocked = true;
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({
            message: "User blocked successfully",
            user: userResponse,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Unblock User - Admin
export const unblockUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid user ID",
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.isblocked = false;
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({
            message: "User unblocked successfully",
            user: userResponse,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Delete User - Admin
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid user ID",
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Prevent admin from deleting another admin user
        if (user.isadmin) {
            return res.status(403).json({
                message: "Admin users cannot be deleted",
            });
        }

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            message: "User deleted successfully",
            deletedUserId: id,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Get Dashboard Statistics - Admin
export const getDashboardStatistics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        const pendingOrders = await Order.countDocuments({
            Orderstatus: "Pending",
        });

        const deliveredOrders = await Order.countDocuments({
            Orderstatus: "Delivered",
        });

        const cancelledOrders = await Order.countDocuments({
            Orderstatus: "Cancelled",
        });

        // Revenue calculation excluding cancelled orders
        const revenueResult = await Order.aggregate([
            {
                $match: {
                    Orderstatus: { $ne: "Cancelled" },
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: { $ifNull: ["$FinalTotal", "$Total"] },
                    },
                },
            },
        ]);

        const totalRevenue =
            revenueResult.length > 0
                ? revenueResult[0].totalRevenue
                : 0;

        return res.status(200).json({
            message: "Dashboard statistics fetched successfully",
            statistics: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue,
                pendingOrders,
                deliveredOrders,
                cancelledOrders,
            },
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
