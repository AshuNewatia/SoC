import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 
export const protect = async (req, res, next) => {
  console.log("==== PROTECT RUNNING ====");
  console.log(req.headers.authorization);

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    console.log("TOKEN FOUND");

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      console.log("DECODED =", decoded);

      req.user = await User.findById(decoded.userId);

      console.log("USER =", req.user?._id);

      next();
    } catch (err) {
      console.log("JWT ERROR =", err.message);

      return res.status(401).json({
        message: "token failed"
      });
    }
  }

  if (!token) {
    console.log("NO TOKEN");

    return res.status(401).json({
      message: "no token"
    });
  }
};
