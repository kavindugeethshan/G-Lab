import Review from "../models/Reviewmodel.js";
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
      console.log(`[Review] User ${userId} has already reviewed product ${productId}`);
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

    // Update product rating information
    const allReviews = await Review.find({
      product: productId,
    });

    const totalRating = allReviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );

    const ratingAverage = totalRating / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      ratingAverage: Number(ratingAverage.toFixed(1)),
      ratingCount: allReviews.length,
    });

    // Emit real-time Socket.IO event if connected
    const io = req.app.get("io");
    console.log(`[Socket.IO] io instance available: ${!!io}`);
    if (io) {
      console.log(`[Socket.IO] Emitting reviewCreated event for product ${productId}`);
      io.emit("reviewCreated", {
        productId,
        review,
        ratingAverage: Number(ratingAverage.toFixed(1)),
        ratingCount: allReviews.length,
      });
    }

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

// Get product rating
export const getProductRating = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).select(
      "ratingAverage ratingCount"
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      productId,
      ratingAverage: product.ratingAverage || 0,
      ratingCount: product.ratingCount || 0,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate("user", "firstname lastname email Image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      productId,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
//-------------------------------------------------------------------------------
//update review function
// Update own review
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Find review by ID
    const review = await Review.findById(req.params.id);

    // Check whether review exists
    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Check whether logged-in user owns this review
    if (review.user.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        message: "You can only update your own review",
      });
    }

    // Update fields if provided
    if (rating !== undefined) {
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    // Save updated review
    await review.save();

    res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

//-------------------------------------------------------------------------------
// delete review function
export const deleteReview = async (req, res) => {
  try {
    // Find review by ID
    const review = await Review.findById(req.params.id);

    // Check whether review exists
    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Check whether logged-in user owns this review
    if (review.user.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        message: "You can only delete your own review",
      });
    }

    // Delete review
    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};