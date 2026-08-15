import express from "express";
import { createReview, getProductRating } from "../Controllers/reviewController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const reviewRouter = express.Router();


// PUBLIC ROUTES
// Anyone can view reviews
reviewRouter.get("/products/:productId/rating", getProductRating);



// PRIVATE USER ROUTES
// User must be logged in to create a review
reviewRouter.post("/products/:productId/reviews", authMiddleware, createReview);


export default reviewRouter;