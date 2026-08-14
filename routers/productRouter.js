import express from "express";
import { createProduct,getallProducts,getProductById,updateProduct,deleteProduct} from "../Controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";   
import { adminMiddleware } from "../middleware/adminMiddleware.js";


const productRouter = express.Router();
//public route
productRouter.get("/", getallProducts);
productRouter.get("/:id", getProductById);

//// Authentication middleware - User must have a valid JWT token
productRouter.use(authMiddleware);
// Authorization - User must be an admin
productRouter.use(adminMiddleware);

// private route
productRouter.post("/create", createProduct);
productRouter.put("/update/:id", updateProduct);
productRouter.delete("/delete/:id",authMiddleware,adminMiddleware,deleteProduct);


export default productRouter;