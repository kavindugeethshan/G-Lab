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
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and contain uppercase, lowercase, and a number",
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

//----------------------------------------------------------------------------
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
      process.env.JWT_SECRET,
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

//----------------------------------------------------------------------------
//Get user profile function
export async function getprofile(req, res) {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      message: "User profile fetched successfully",
      user
    })
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    })
  }
}
//-------------------------------------------------------------------------
//Update user profile function 
export const updateprofule = async (req, res) => {
  try {
    const { firstname, lastname, email, image, Image } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (firstname !== undefined) {
      if (typeof firstname !== "string") {
        return res.status(400).json({
          message: "First name must be a string",
        });
      }

      const cleanFirstname = firstname.trim();

      if (cleanFirstname.length < 2 || cleanFirstname.length > 50) {
        return res.status(400).json({
          message: "First name must be between 2 and 50 characters",
        });
      }

      user.firstname = cleanFirstname;
    }

    if (lastname !== undefined) {
      if (typeof lastname !== "string") {
        return res.status(400).json({
          message: "Last name must be a string",
        });
      }

      const cleanLastname = lastname.trim();

      if (cleanLastname.length < 2 || cleanLastname.length > 50) {
        return res.status(400).json({
          message: "Last name must be between 2 and 50 characters",
        });
      }

      user.lastname = cleanLastname;
    }
    if (email) {
      const cleanEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        email: cleanEmail,
        _id: { $ne: req.user.userId },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email is already in use",
        });
      }

      user.email = cleanEmail;
    }

    const profilePic = image !== undefined ? image : Image;
    if (profilePic !== undefined) user.Image = profilePic.trim();

    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "user profile updated successfully",
      user: userResponse
    });

  } catch (err) {
    res.status(500).json({
      message: "server error",
      error: err.message
    })
  }
}
//---------------------------------------------------------------------
//change password 
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required"
      });
    }
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isPasswordvalid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordvalid) {
      return res.status(400).json({
        message: "Incorrect current password"
      });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;

    await user.save();
    res.status(200).json({
      message: "Password changed successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    })
  }
}

//---------------------------------------------------------------------------
//Delete  own account 
export const deleteOwnAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(req.user.userId);

    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
//-----------------------------------------------------------------
//// Update user address
export const updateAddress = async (req, res) => {
  try {
    const addressData = req.body.address || req.body;
    const { addressLine, city, district, postalCode } = addressData;


    // Find logged-in user
    const user = await User.findById(req.user.userId);

    // Check whether user exists
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (!addressLine || typeof addressLine !== "string") {
      return res.status(400).json({
        message: "Address line is required",
      });
    }

    if (!city || typeof city !== "string") {
      return res.status(400).json({
        message: "City is required",
      });
    }

    if (!district || typeof district !== "string") {
      return res.status(400).json({
        message: "District is required",
      });
    }

    if (!postalCode || typeof postalCode !== "string") {
      return res.status(400).json({
        message: "Postal code is required",
      });
    }
    // Update address
    user.address = {
      addressLine: addressLine.trim(),
      city: city.trim(),
      district: district.trim(),
      postalCode: postalCode.trim(),
    };

    // Save updated user
    await user.save();

    res.status(200).json({
      message: "Address updated successfully",
      address: user.address,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};