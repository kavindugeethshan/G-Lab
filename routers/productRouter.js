import express from "express";
import { getallProducts, getProductById } from "../Controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/", getallProducts);
productRouter.get("/:id", getProductById);

export default productRouter;