import Product from "../models/Productmodel.js";

//create product function
export const createProduct = async (req, res) => {
  try {
    // Get product details from request body
    const { name, description, category, brand, price, stock, image } =
      req.body;

    // Validate product name
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        message: "Product name is required",
      });
    }
    // Validate product name
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    // Validate product description
    if (!description || typeof description !== "string") {
      return res.status(400).json({
        message: "Product description is required",
      });
    }

    // Validate product category
    if (!category || typeof category !== "string") {
      return res.status(400).json({
        message: "Product category is required",
      });
    }

    // Validate product brand
    if (!brand || typeof brand !== "string") {
      return res.status(400).json({
        message: "Product brand is required",
      });
    }

    // Validate product price
    if (price === undefined || price === null || typeof price !== "number") {
      return res.status(400).json({
        message: "Valid product price is required",
      });
    }

    // Check whether price is negative
    if (price < 0) {
      return res.status(400).json({
        message: "Product price cannot be negative",
      });
    }

    // Validate product stock quantity
    if (stock === undefined || stock === null || typeof stock !== "number") {
      return res.status(400).json({
        message: "Valid product stock quantity is required",
      });
    }

    // Check whether stock is negative
    if (stock < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative",
      });
    }

    //create new product in mongoDB
    const createdProduct = await Product.create({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      brand: brand.trim(),
      price,
      stock,
      image,
      isavailable: stock > 0,
    });

    // Send successful response
    res.status(201).json({
      message: "Product created successfully",
      product: createdProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//-----------------------------------------------------------------------------------------
    //Getall product function
    export const getallProducts = async (req, res) => {
      try {
        const product = await Product.find();
        res.status(200).json({
          message: "Products retrieved successfully",
          products: product,
        });
      } catch (error) {
        res.status(500).json({
          message: error.message,
        });
      }
    };

