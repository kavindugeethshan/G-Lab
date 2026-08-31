import User from "../models/Usermodel.js";
import PendingUser from "../models/PendingUserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import PasswordReset from "../models/PasswordResetModel.js";


// Helper to get fresh Nodemailer transporter with clean credentials
const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

// Create user function
export const createUser = async (req, res) => {
  try {
    console.log("[REGISTER] 1 - createUser started");

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

    // Check whether the email already exists in the main User collection
    console.log("[REGISTER] 2 - checking existing user");
    const existingUser = await User.findOne({
      email: cleanEmail,
    });
    console.log("[REGISTER] 3 - existing user check completed");

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Hash the password before saving
    const saltRounds = 12;
    console.log("[REGISTER] 4 - starting password hash");
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("[REGISTER] 5 - password hash completed");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Save registration in PendingUser collection (overwrite previous pending registration if any)
    console.log("[REGISTER] 6 - creating pending user");
    await PendingUser.findOneAndDelete({ email: cleanEmail });
    await PendingUser.create({
      email: cleanEmail,
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      password: hashedPassword,
      Image,
      emailverificationotp: otp,
      emailverificationotpexpires: otpExpires,
    });
    console.log("[REGISTER] 7 - pending user created");

    console.log("[REGISTER] 8 - creating email transporter");
    const transporter = getTransporter();
    console.log("[REGISTER] 9 - email transporter created");

    console.log("[REGISTER] 10 - starting OTP email send");
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: cleanEmail,
      subject: "G-Lab Email Verification",
      text: `Your G-Lab verification code is: ${otp}. This code expires in 10 minutes.`,
    });
    console.log("[REGISTER] 11 - OTP email sent");
    console.log(`✉️ OTP Email sent successfully to pending user: ${cleanEmail}`);

    console.log("[REGISTER] 12 - sending response");
    res.status(201).json({
      message: "Verification code sent to your email.",
      email: cleanEmail
    });
    console.log("[REGISTER] 13 - response completed");
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

    if (user.isadmin) {
      return res.status(403).json({
        message: "Admin accounts cannot be deleted",
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

//--------------------------------------------------------------------------------
// Resend OTP for Pending User
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user is already verified in main collection
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    const pendingUser = await PendingUser.findOne({ email: cleanEmail });
    if (!pendingUser) {
      return res.status(404).json({
        message: "Pending registration not found. Please sign up again.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    pendingUser.emailverificationotp = otp;
    pendingUser.emailverificationotpexpires = otpExpires;
    await pendingUser.save();

    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: cleanEmail,
      subject: "G-Lab Email Verification - Resend",
      text: `Your G-Lab verification code is: ${otp}. This code expires in 10 minutes.`,
    });

    res.status(200).json({
      message: "OTP resent successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

//--------------------------------------------------------------------------------
// Verify Email & Create User in main collection ONLY upon OTP match
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Search in PendingUser model
    const pendingUser = await PendingUser.findOne({ email: cleanEmail });

    if (!pendingUser) {
      // Check if user already exists in main collection
      const verifiedUser = await User.findOne({ email: cleanEmail });
      if (verifiedUser) {
        return res.status(400).json({
          message: "Email is already verified",
        });
      }
      return res.status(404).json({
        message: "Pending registration not found or expired. Please sign up again.",
      });
    }

    if (new Date() > pendingUser.emailverificationotpexpires) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    if (pendingUser.emailverificationotp !== otp.toString().trim()) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // ONLY NOW create the real User document in main collection
    const createdUser = await User.create({
      email: pendingUser.email,
      firstname: pendingUser.firstname,
      lastname: pendingUser.lastname,
      password: pendingUser.password, // Already hashed
      Image: pendingUser.Image,
      isemailverified: true,
    });

    // Delete temporary registration from PendingUser collection
    await PendingUser.deleteOne({ _id: pendingUser._id });

    const userResponse = createdUser.toObject();
    delete userResponse.password;

    return res.status(200).json({
      message: "Email verified successfully! Your account has been created.",
      user: userResponse
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

//--------------------------------------------------------------------------------
// FORGOT PASSWORD - Step 1: Send Reset OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await PasswordReset.findOneAndDelete({
      email: cleanEmail,
    });

    await PasswordReset.create({
      email: cleanEmail,
      otp,
      expiresAt,
      verified: false,
    });

    const transporter = getTransporter();

    // Send email asynchronously in background to ensure fast response
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: cleanEmail,
      subject: "G-Lab Password Reset",
      text: `Your G-Lab password reset code is: ${otp}. This code expires in 10 minutes.`,
    }).catch(err => console.error("Forgot password email send error:", err));

    return res.status(200).json({
      message: "Password reset code sent to your email.",
    });

  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Failed to send password reset code.",
    });
  }
};

//--------------------------------------------------------------------------------
// FORGOT PASSWORD - Step 2: Verify Reset OTP
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !otp) {
      return res.status(400).json({
        message: "Email and OTP code are required",
      });
    }

    const resetRecord = await PasswordReset.findOne({ email: cleanEmail });

    if (!resetRecord) {
      return res.status(404).json({
        message: "Reset request not found or expired. Please request a new code.",
      });
    }

    if (new Date() > resetRecord.expiresAt) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new code.",
      });
    }

    if (resetRecord.otp !== otp.toString().trim()) {
      return res.status(400).json({
        message: "Invalid OTP code",
      });
    }

    resetRecord.verified = true;
    await resetRecord.save();

    return res.status(200).json({
      message: "OTP verified successfully. You can now enter your new password.",
    });
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    return res.status(500).json({
      message: "Failed to verify OTP.",
    });
  }
};

//--------------------------------------------------------------------------------
// FORGOT PASSWORD - Step 3: Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP, and new password are required",
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and contain uppercase, lowercase, and a number",
      });
    }

    const resetRecord = await PasswordReset.findOne({ email: cleanEmail });

    if (!resetRecord) {
      return res.status(404).json({
        message: "Reset request not found. Please request a new code.",
      });
    }

    if (new Date() > resetRecord.expiresAt) {
      return res.status(400).json({
        message: "Reset session expired. Please request a new code.",
      });
    }

    if (!resetRecord.verified || resetRecord.otp !== otp.toString().trim()) {
      return res.status(400).json({
        message: "Please verify your OTP before resetting password.",
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    await user.save();

    // Delete the reset record so it cannot be reused
    await PasswordReset.deleteOne({ _id: resetRecord._id });

    return res.status(200).json({
      message: "Password reset successfully! Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      message: "Failed to reset password.",
    });
  }
};