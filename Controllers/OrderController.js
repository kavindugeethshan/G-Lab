import Order from "../models/Ordermodel.js";
import Product from "../models/Productmodel.js";
import User from "../models/Usermodel.js";
import Cart from "../models/Cartmodel.js";


//------------------------------------------------------------------------
//CREATE ORDER
export const createOrder = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!userId) {
            return res.status(400).json({
                message: "User not found",
            });
        }
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
            });
        }

        if (cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Validate Delivery Address
        const userAddr = user.address || {};
        if (!userAddr.addressLine || !userAddr.city || !userAddr.district || !userAddr.postalCode) {
            return res.status(400).json({
                message: "Your delivery address is incomplete. Please set your address in Profile settings before placing an order."
            });
        }

        const orderProducts = [];

        for (const item of cart.items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    message: `Product not found: ${item.product}`,
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Not enough stock for ${product.name}`,
                });
            }

            orderProducts.push({
                productId: product._id,
                name: product.name,
                description: product.description,
                brand: product.brand,
                discount: product.discount || 0,
                price: product.price,
                quantity: item.quantity,
            });
        }

        let totalAmount = 0;

        for (const item of orderProducts) {
            const discountedPrice =
                item.price - (item.price * item.discount) / 100;

            totalAmount += discountedPrice * item.quantity;
        }

        const order = await Order.create({
            User: userId,
            Products: orderProducts,
            Total: totalAmount,

            Diliveryaddress: {
                addressLine: userAddr.addressLine,
                city: userAddr.city,
                district: userAddr.district,
                postalCode: userAddr.postalCode
            },

            Orderstatus: "Pending",
        });

        cart.items = [];
        await cart.save();

        return res.status(201).json({
            message: "Order created successfully",
            order,
        });
    } catch (error) {
        console.error("Create order error:", error);

        return res.status(500).json({
            message: "Failed to create order",
            error: error.message,
        });
    }
};
//------------------------------------------------------------------------
// GET MY ORDERS

export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!userId) {
            return res.status(400).json({
                message: "User not found",
            });
        }

        const orders = await Order.find({ User: userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Orders fetched successfully",
            orders,
        });

    } catch (error) {
        console.log(error.message);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

//------------------------------------------------------------------------
// GET ORDER BY ID

export const getOrderById = async (req, res) => {
    try {
        const userId = req.user.userId; // changed here
        const { id } = req.params;

        if (!userId) {
            return res.status(400).json({
                message: "User not found",
            });
        }

        const order = await Order.findOne({
            _id: id,
            User: userId,
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        return res.status(200).json({
            message: "Order fetched successfully",
            order,
        });

    } catch (error) {
        console.log(error.message);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};