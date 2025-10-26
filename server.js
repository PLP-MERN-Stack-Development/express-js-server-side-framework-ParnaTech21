// Import dependencies
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

//Middleware setup
app.use(bodyParser.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const validKey = process.env.API_KEY || "mysecretkey";
  if (apiKey !== validKey) {
    return res.status(401).json({ error: "Unauthorized: Invalid API key" });
  }
  next();
};


//MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/productsdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


//Product Schema & Model
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  inStock: { type: Boolean, required: true },
});

const Product = mongoose.model("Product", productSchema);


//Routes
// Root
app.get("/", (req, res) => {
  res.send("Welcome to the Product API! Use /api/products to get started.");
});

//GET all products with filtering, pagination
app.get("/api/products", async (req, res, next) => {
  try {
    const { category, page = 1, limit = 5 } = req.query;
    const filter = category ? { category } : {};

    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.json({ total, page: Number(page), products });
  } catch (err) {
    next(err);
  }
});

//GET product by ID
app.get("/api/products/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next({ status: 404, message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

//POST create product
app.post("/api/products", authMiddleware, async (req, res, next) => {
  try {
    const { name, description, price, category, inStock } = req.body;
    if (!name || !description || price == null || !category || inStock == null) {
      return next({ status: 400, message: "All fields are required" });
    }

    const newProduct = new Product({ name, description, price, category, inStock });
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (err) {
    next(err);
  }
});

//PUT update product
app.put("/api/products/:id", authMiddleware, async (req, res, next) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) return next({ status: 404, message: "Product not found" });

    res.json(updatedProduct);
  } catch (err) {
    next(err);
  }
});

//DELETE product
app.delete("/api/products/:id", authMiddleware, async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return next({ status: 404, message: "Product not found" });
    res.json({ message: "Product deleted successfully", deleted });
  } catch (err) {
    next(err);
  }
});

//SEARCH products by name
app.get("/api/products/search", async (req, res, next) => {
  try {
    const { name } = req.query;
    if (!name) return next({ status: 400, message: "Missing search query" });

    const results = await Product.find({
      name: { $regex: name, $options: "i" },
    });
    res.json(results);
  } catch (err) {
    next(err);
  }
});

//Product statistics by category
app.get("/api/products/stats", async (req, res, next) => {
  try {
    const stats = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});


//Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

module.exports = app;
