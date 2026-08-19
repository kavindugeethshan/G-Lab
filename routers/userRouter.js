import express from "express";
import { createUser, loginUser, getprofile, updateprofule } from "../Controllers/userController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const userRouter = express.Router();


// Public routes
userRouter.post("/create", createUser);
userRouter.post("/login", loginUser);


// Authentication middleware
userRouter.use(authMiddleware);
// Protected routes
userRouter.get("/profile", getprofile);
userRouter.put("/profile", updateprofule);

export default userRouter;