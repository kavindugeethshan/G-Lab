import express from "express";
import { createProduct,} from "../Controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";   
import { adminMiddleware } from "../middleware/adminMiddleware.js";


const productRouter = express.Router();

//// Authentication middleware - User must have a valid JWT token
productRouter.use(authMiddleware);
// Authorization - User must be an admin
productRouter.use(adminMiddleware);

// Create Product Route
productRouter.post("/create", createProduct);


export default productRouter;