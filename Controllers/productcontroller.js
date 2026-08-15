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
//create many product function
export const createManyProducts = async (req, res) => {
  try {
    // Get the products array from the request body
    const products = req.body;

    // Check whether the request body is an array
    if (!Array.isArray(products)) {
      return res.status(400).json({
        message: "Request body must be an array of products",
      });
    }

    // Check whether the array is empty
    if (products.length === 0) {
      return res.status(400).json({
        message: "Product list cannot be empty",
      });
    }

    // Validate each product before inserting
    for (const product of products) {
      const {
        name,
        description,
        category,
        brand,
        price,
        stock,
      } = product;

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

      // Validate price
      if (
        price === undefined ||
        price === null ||
        typeof price !== "number" ||
        price < 0
      ) {
        return res.status(400).json({
          message: "Valid product price is required",
        });
      }

      // Validate stock
      if (
        stock === undefined ||
        stock === null ||
        typeof stock !== "number" ||
        stock < 0
      ) {
        return res.status(400).json({
          message: "Valid product stock quantity is required",
        });
      }
    }

    // Prepare products before inserting them into MongoDB
    const productsToCreate = products.map((product) => ({
      name: product.name.trim(),
      description: product.description.trim(),
      category: product.category.trim(),
      brand: product.brand.trim(),
      price: product.price,
      stock: product.stock,
      image: product.image,
      isavailable: product.stock > 0,
    }));

    // Insert all products into MongoDB
    const createdProducts = await Product.insertMany(productsToCreate);

    // Send successful response
    res.status(201).json({
      message: "Products created successfully",
      count: createdProducts.length,
      products: createdProducts,
    });
  } catch (error) {
    // Handle server/database errors
    res.status(500).json({
      message: error.message,
    });
  }
};
//-----------------------------------------------------------------------------------------
// //Getall product function
// export const getallProducts = async (req, res) => {
//   try {
//     const product = await Product.find();
//     res.status(200).json({
//       message: "Products retrieved successfully",
//       products: product,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// //Getall product by search function
// export const getallProducts = async (req, res) => {
//   try {
//     // Get the search value from the URL query
//     const { search } = req.query;

//     // Create an empty filter object
//     const filter = {};

//     // Check whether a search value was provided
//     if (search) {
//       // Search product name, category, or brand
//       filter.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { category: { $regex: search, $options: "i" } },
//         { brand: { $regex: search, $options: "i" } },
//       ];
//     }

//     // Find products using the filter
//     const products = await Product.find(filter);

//     // Send successful response
//     res.status(200).json({
//       message: "Products retrieved successfully",
//       count: products.length,
//       products: products,
//     });
//   } catch (error) {
//     // Handle server/database errors
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// Getall product by filter  function
// export const getallProducts = async (req, res) => {
//   try {
//     // Get search and category values from the URL query
//     const { search, category } = req.query;

//     // Create an empty filter object
//     const filter = {};

//     // Search by product name, category, or brand
//     if (search) {
//       filter.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { category: { $regex: search, $options: "i" } },
//         { brand: { $regex: search, $options: "i" } },
//       ];
//     }

//     // Filter products by category
//     if (category) {
//       filter.category = {
//         $regex: `^${category}$`,
//         $options: "i",
//       };
//     }

//     // Find products using the generated filter
//     const products = await Product.find(filter);

//     // Send successful response
//     res.status(200).json({
//       message: "Products retrieved successfully",
//       count: products.length,
//       products: products,
//     });
//   } catch (error) {
//     // Handle server/database errors
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

//Get all product Brand Filter + Price Filter
export const getallProducts = async (req, res) => {
  try {
    // Get filter values from the URL query
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
    } = req.query;

    // Create an empty MongoDB filter object
    const filter = {};

    // Search by product name, category, or brand
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category) {
      filter.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }

    // Filter by brand
    if (brand) {
      filter.brand = {
        $regex: `^${brand}$`,
        $options: "i",
      };
    }

    // Filter by minimum price
    if (minPrice !== undefined) {
      const minimumPrice = Number(minPrice);

      // Check whether minPrice is a valid number
      if (Number.isNaN(minimumPrice) || minimumPrice < 0) {
        return res.status(400).json({
          message: "Invalid minimum price",
        });
      }

      filter.price = {
        ...filter.price,
        $gte: minimumPrice,
      };
    }

    // Filter by maximum price
    if (maxPrice !== undefined) {
      const maximumPrice = Number(maxPrice);

      // Check whether maxPrice is a valid number
      if (Number.isNaN(maximumPrice) || maximumPrice < 0) {
        return res.status(400).json({
          message: "Invalid maximum price",
        });
      }

      filter.price = {
        ...filter.price,
        $lte: maximumPrice,
      };
    }

    // Check whether minimum price is greater than maximum price
    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      Number(minPrice) > Number(maxPrice)
    ) {
      return res.status(400).json({
        message: "Minimum price cannot be greater than maximum price",
      });
    }

    // Find products using the generated filter
    const products = await Product.find(filter);

    // Send successful response
    res.status(200).json({
      message: "Products retrieved successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    // Handle server/database errors
    res.status(500).json({
      message: error.message,
    });
  }
};
//-----------------------------------------------------------------------------------------
//Getall productby id  function
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product retrieved successfully",
      product: product,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//-----------------------------------------------------------------------------------------
//updateProduct
export const updateProduct = async (req, res) => {
  try {
    // Get the product ID from the URL
    const { id } = req.params;

    // Get updated product data from request body
    const updateData = req.body;

    // Find the product by ID and update it
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      // Return the updated product after the update
      returnDocument: "after",

      // Run Mongoose schema validation during update
      runValidators: true,
    });

    // Check whether the product exists
    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Send successful response
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    // Handle server/database errors
    res.status(500).json({
      message: error.message,
    });
  }
};
//---------------------------------------------------------------------------------------------
//deleteProduct function
export const deleteProduct = async (req, res) => {
  try {
    //get the product id from url
    const { id } = req.params;
    // Find the product by ID and delete it
    const deletedProduct = await Product.findByIdAndDelete(id);

    // Check whether the product exists
    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Send successful response
    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//--------------------------------------------------------------------------------------------------
