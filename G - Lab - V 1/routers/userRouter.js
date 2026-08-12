import express from "express";
import { createUser } from "../Controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/create", createUser);

export default userRouter;