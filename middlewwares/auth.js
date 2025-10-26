/*export default function auth(req, res, next) {
  const apiKey = req.headers["x-api-key:API_KEY"];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: "Unauthorized: Invalid API key" });
  }
  next();
}
*/