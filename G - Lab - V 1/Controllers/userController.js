import User from "../models/Usermodel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Create user function
export const createUser = async (req, res) => {
  try {
    // Get only the fields that a normal user is allowed to send
    const { email, firstname, lastname, password, Image } = req.body;

    // Validate email is provided
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Remove unnecessary spaces and convert email to lowercase
    const cleanEmail = email.trim().toLowerCase();

    // Check whether the email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // Validate first name is provided
    if (!firstname || typeof firstname !== "string") {
      return res.status(400).json({
        message: "First name is required",
      });
    }

    // Check first name length
    if (firstname.trim().length < 2 || firstname.trim().length > 50) {
      return res.status(400).json({
        message: "First name must be between 2 and 50 characters",
      });
    }

    // Validate last name is provided
    if (!lastname || typeof lastname !== "string") {
      return res.status(400).json({
        message: "Last name is required",
      });
    }

    // Check last name length
    if (lastname.trim().length < 2 || lastname.trim().length > 50) {
      return res.status(400).json({
        message: "Last name must be between 2 and 50 characters",
      });
    }

    // Validate password is provided
    if (!password || typeof password !== "string") {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    // Check minimum password length
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // Check whether the email already exists in the database
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Hash the password before saving it to the database
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the user
    const createdUser = await User.create({
      email: cleanEmail,
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      password: hashedPassword,
      Image,
    });

    // Do not return the hashed password to the frontend
    const userResponse = createdUser.toObject();
    delete userResponse.password;

    // Return the newly created user
    res.status(201).json(userResponse);
  } catch (err) {
    // Handle unexpected server/database errors
    res.status(500).json({
      message: err.message,
    });
  }
};

// Login user function
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Validate password
    if (!password || typeof password !== "string") {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    // Clean email
    const cleanEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await User.findOne({
      email: cleanEmail,
    });

    // Check whether user exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare entered password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    //check if user is blocked
    if (user.isblocked) {
      return res.status(403).json({
        message: "Your account has been blocked",
      });
    }
    // Check password
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    //create jwt token
    const token = jwt.sign(
  {
    userId: user._id,
    email: user.email,
    isadmin: user.isadmin,
    isblocked: user.isblocked,
    image: user.Image,
  },
  "G-Lab-2026-My-Secret-Key-9xK72",
  {
    expiresIn: "1h",
  }
);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Login successful
    res.status(200).json({
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
