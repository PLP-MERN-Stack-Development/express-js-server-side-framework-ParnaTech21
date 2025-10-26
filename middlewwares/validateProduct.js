export default function validateProduct(req, res, next) {
  const { name, description, price, category, inStock } = req.body;
  if (!name || !description || price == null || !category || inStock == null) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (typeof price !== "number") {
    return res.status(400).json({ message: "Price must be a number" });
  }
  next();
}
