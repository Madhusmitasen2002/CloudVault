import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No or malformed token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET); // ✅ FIXED KEY NAME
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
