import express from "express";
import {
  login,
  logout,
  signup,
  updateUser,
} from "../controllers/auth.controller.js";
import { protectroute } from "../middleware/protectroute.js";
import { getcurrentuser } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", protectroute, getcurrentuser);
authRouter.put("/:id", protectroute, updateUser);

export default authRouter;
