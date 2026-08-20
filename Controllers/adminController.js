import Order from "../models/Ordermodel.js";

export const adminDashboard = async (req, res) => {
    try {
        res.status(200).json({
            message: "Welcome to Admin Dashboard",
            admin: req.user
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
//------------------------------------------------------------------------------------------
//updateOrderStatus()
export const updateOrderStatus = async (req, res) => {
    try {

        // Get the Order ID from the URL
        const { id } = req.params;

        // Get the new status from the request body
        const { status } = req.body;


        // Check whether Order ID was provided
        if (!id) {
            return res.status(400).json({
                message: "Order ID is required",
            });
        }


        // These are the only statuses allowed in our system
        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Shipped",
            "Delivered",
            "Cancelled",
        ];


        // Check whether the provided status is valid
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status",
            });
        }


        // Find the order using the Order ID
        const order = await Order.findById(id);


        // If the order doesn't exist
        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }


        // Update the order status
        order.Orderstatus = status;


        // Save the updated order to MongoDB
        await order.save();


        // Send the updated order back to the client
        return res.status(200).json({
            message: "Order status updated successfully",
            order,
        });


    } catch (error) {

        // Log the actual error for debugging
        console.log(error.message);


        // Send server error response
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};