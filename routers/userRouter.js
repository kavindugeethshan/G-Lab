import express from "express";
import { createUser, loginUser } from "../Controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const userRouter = express.Router();


// Public routes
userRouter.post("/create", createUser);
userRouter.post("/login", loginUser);


// Authentication middleware
userRouter.use(authMiddleware);

// Protected routes


export default userRouter;