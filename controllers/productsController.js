import products, { generateId } from "../models/productModel.js";

export const getAllProducts = (req, res) => {
  let result = [...products];
  const { category, page = 1, limit = 5 } = req.query;

  if (category) result = result.filter(p => p.category === category);

  const start = (page - 1) * limit;
  const end = start + Number(limit);
  const paginated = result.slice(start, end);

  res.json({ total: result.length, page: Number(page), products: paginated });
};

export const getProductById = (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return next({ status: 404, message: "Product not found" });
  res.json(product);
};

export const createProduct = (req, res) => {
  const newProduct = { id: generateId(), ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
};

export const updateProduct = (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return next({ status: 404, message: "Product not found" });
  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
};

export const deleteProduct = (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return next({ status: 404, message: "Product not found" });
  const deleted = products.splice(index, 1);
  res.json({ message: "Product deleted", deleted });
};

export const searchProducts = (req, res) => {
  const { name } = req.query;
  const results = products.filter(p =>
    p.name.toLowerCase().includes(name.toLowerCase())
  );
  res.json(results);
};

export const getStats = (req, res) => {
  const stats = {};
  products.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });
  res.json(stats);
};
