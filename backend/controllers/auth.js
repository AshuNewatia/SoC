import userModel from "../models/user.js"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import config from "../config/config.js"

export const signup = async (req, res) => {
      const {username, email, password} = req.body;
      const isAlreadyRegistered = await userModel.findOne({
        $or: [
          {username: usernme},
          {email: email}
        ]
      })
      if (isAlreadyRegistered){
        res.status(409).json({
          message: "Email already Exists!"
        })
      }

      const hashedPassword = crypto.createHash("sha256").update(password).digest("hex")

      const user = await userModel.create({
        username,
        email,
        password: hashedPassword
      })

      const token = jwt.sign({
        id: user._id
      }, config.JWT_SECRET, {
        expiresIn: "id"
      })

      res.status(201). json({
        message: "User Registered Successfully",
        user: {
          username: user.username,
          email: user.email,
        },
        token
      })
}
