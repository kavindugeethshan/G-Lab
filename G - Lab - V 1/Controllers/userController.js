import User from "../models/User.js";

export const createUser = async (req, res) => {
    try {
        // Get only the fields that a normal user is allowed to send
        const { email, firstname, lastname, password, Image } = req.body;

        // Validate email is provided
        if (!email || typeof email !== "string") {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        // Remove unnecessary spaces and convert email to lowercase
        const cleanEmail = email.trim().toLowerCase();

        // Check whether the email format is valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address"
            });
        }

        // Validate first name is provided
        if (!firstname || typeof firstname !== "string") {
            return res.status(400).json({
                message: "First name is required"
            });
        }

        // Check first name length
        if (firstname.trim().length < 2 || firstname.trim().length > 50) {
            return res.status(400).json({
                message: "First name must be between 2 and 50 characters"
            });
        }

        // Validate last name is provided
        if (!lastname || typeof lastname !== "string") {
            return res.status(400).json({
                message: "Last name is required"
            });
        }

        // Check last name length
        if (lastname.trim().length < 2 || lastname.trim().length > 50) {
            return res.status(400).json({
                message: "Last name must be between 2 and 50 characters"
            });
        }

        // Validate password is provided
        if (!password || typeof password !== "string") {
            return res.status(400).json({
                message: "Password is required"
            });
        }

        // Check minimum password length
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        // Check whether the email already exists in the database
        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        // Create the user with only the allowed fields
        // isadmin, isblocked and isemailverified are NOT taken from req.body
        const createdUser = await User.create({
            email: cleanEmail,
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            password,
            Image
        });

        // Return the newly created user
        res.status(201).json(createdUser);

    } catch (err) {
        // Handle unexpected server/database errors
        res.status(500).json({
            message: err.message
        });
    }
};