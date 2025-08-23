// server/routes/authRoutes.js
import express from "express";
import { signup, login, refresh, logout } from "../controllers/auth.controller.js";

const router = express.Router();
router.post("/register", signup);
router.post("/login", login);
router.post("/refresh", refresh);  // <-- new
router.post("/logout", logout);    // <-- new
export default router;
