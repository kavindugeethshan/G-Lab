import Cart from "../models/Cartmodel.js";
import Product from "../models/Productmodel.js";

// Calculate discounted price
const getDiscountedPrice = (price, discount) => {
    return price - (price * discount) / 100;
};

// Add product to cart
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const userId = req.user.userId;

        // Check product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({
                message: "Not enough stock",
            });
        }

        // Find user's cart
        let cart = await Cart.findOne({ user: userId });

        // Create cart if it doesn't exist
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [
                    {
                        product: productId,
                        quantity,
                    },
                ],
            });

            await cart.save();

            return res.status(201).json({
                message: "Product added to cart",
                cart,
            });
        }

        // Check whether product already exists in cart
        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            if (newQuantity > product.stock) {
                return res.status(400).json({
                    message: "Not enough stock",
                });
            }

            existingItem.quantity = newQuantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
            });
        }

        await cart.save();

        res.status(200).json({
            message: "Product added to cart",
            cart,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


// Get user's cart
export const getCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        const cart = await Cart.findOne({ user: userId }).populate(
            "items.product"
        );

        if (!cart) {
            return res.status(200).json({
                message: "Cart is empty",
                items: [],
                total: 0,
            });
        }

        let total = 0;

        const items = cart.items.map((item) => {
            const product = item.product;

            const discount = product.discount || 0;

            const discountedPrice = getDiscountedPrice(
                product.price,
                discount
            );

            const itemTotal = discountedPrice * item.quantity;

            total += itemTotal;

            return {
                product: product,
                quantity: item.quantity,
                originalPrice: product.price,
                discount: discount,
                discountedPrice: discountedPrice,
                itemTotal: itemTotal,
            };
        });

        res.status(200).json({
            message: "Cart fetched successfully",
            items,
            total,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


// Update cart quantity
export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        const userId = req.user.userId;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                message: "Not enough stock",
            });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
            });
        }

        const item = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                message: "Product not found in cart",
            });
        }

        item.quantity = quantity;

        await cart.save();

        res.status(200).json({
            message: "Cart quantity updated",
            cart,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


// Remove product from cart
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const userId = req.user.userId;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
            });
        }

        const itemExists = cart.items.some(
            (item) => item.product.toString() === productId
        );

        if (!itemExists) {
            return res.status(404).json({
                message: "Product not found in cart",
            });
        }

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );

        await cart.save();

        res.status(200).json({
            message: "Product removed from cart",
            cart,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


// Clear entire cart
export const clearCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
            });
        }

        cart.items = [];

        await cart.save();

        res.status(200).json({
            message: "Cart cleared successfully",
            cart,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};