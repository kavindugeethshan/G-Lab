import  Review from "../models/Reviewmodel.js";
import Product from "../models/Productmodel.js";

// Create a new product review
export const createReview = async (req, res) => {
  try {
    // Get product ID from URL
    const { productId } = req.params;

    // Get rating and comment from request body
    const { rating, comment } = req.body;

    // Get logged-in user's ID from JWT
    const userId = req.user.userId;
    // Check whether product ID exists
    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    // Check whether rating was provided
    if (rating === undefined || rating === null) {
      return res.status(400).json({
        message: "Rating is required",
      });
    }

    // Check whether rating is a number
    if (typeof rating !== "number") {
      return res.status(400).json({
        message: "Rating must be a number",
      });
    }

    // Rating must be between 1 and 5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // Check whether comment exists
    if (!comment || typeof comment !== "string") {
      return res.status(400).json({
        message: "Review comment is required",
      });
    }

    // Check whether comment is empty after removing spaces
    if (comment.trim().length === 0) {
      return res.status(400).json({
        message: "Review comment cannot be empty",
      });
    }

    // Check whether the product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Check whether this user already reviewed this product
    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }

    // Create the review
    const review = await Review.create({
      user: userId,
      product: productId,
      rating,
      comment: comment.trim(),
    });

    // Send successful response
    res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};