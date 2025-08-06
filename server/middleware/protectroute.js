import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectroute = async (req, res, next) => {
  try {
    const token = req.cookies["nfc-token"];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token found" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(`Error in ProtectRoute: ${error}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
