import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        User: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        Products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },

                name: {
                    type: String,
                    required: true,
                },

                description: {
                    type: String,
                },

                brand: {
                    type: String,
                },

                discount: {
                    type: Number,
                    default: 0,
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
            },
        ],

        Total: {
            type: Number,
            required: true,
            min: 0,
        },

        Diliveryaddress: {
            addressLine: {
                type: String,
                required: true,
            },

            city: {
                type: String,
                required: true,
            },

            district: {
                type: String,
                required: true,
            },

            postalCode: {
                type: String,
                required: true,
            },
        },

        Orderstatus: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Shipped",
                "Delivered",
                "Cancelled",
            ],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

const Order =
    mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;