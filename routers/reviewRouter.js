import express from "express";

import { createReview } from "../Controllers/reviewController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const reviewRouter = express.Router();

// User must be logged in to create a review
reviewRouter.post(
  "/products/:productId/reviews",
  authMiddleware,
  createReview
);

export default reviewRouter;