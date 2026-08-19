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