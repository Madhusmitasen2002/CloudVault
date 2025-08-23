// server/controllers/auth.controller.js
import bcrypt from "bcryptjs"; // 🔹 use bcryptjs (lighter, easier for Node ESM)
import jwt from "jsonwebtoken";
import supabase from "../supabase/supabaseClient.js";
import {
  signAccessToken,
  signRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} from "../utils/tokens.js";

// ===== Signup =====
export const signup = async (req, res) => {
  const { name = "", email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email & password required" });
    }

    // check if already registered
    const { data: existing, error: existErr } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existErr) throw existErr;
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user
    const { data, error } = await supabase
      .from("users")
      .insert([{ name, email, password: hashedPassword }])
      .select();

    if (error) throw error;

    return res.json({
      message: "User created successfully",
      user: data[0],
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    return res
      .status(500)
      .json({ error: err.message || "Signup failed" });
  }
};

// ===== Login =====
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, password") // only select needed fields
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (typeof user.password !== "string") {
      console.error("Password is not string:", user.password);
      return res.status(500).json({ error: "Corrupted password data" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const payload = { id: user.id, email: user.email };
    const access = signAccessToken(payload);
    const refresh = signRefreshToken(payload);

    setRefreshCookie(res, refresh);
    

    return res.json({
      message: "Login successful",
      token: access,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ error: err.message || "Login failed" });
  }
};


// ===== Refresh =====
export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken; // 🔹 match the cookie name you set
    if (!token) {
      return res.status(401).json({ error: "No refresh token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const payload = { id: decoded.id, email: decoded.email };

    const access = signAccessToken(payload);
    return res.json({ token: access });
  } catch (err) {
    console.error("Refresh error:", err.message);
    return res.status(403).json({ error: "Invalid or expired refresh token" });
  }
};

// ===== Logout =====
export const logout = async (_req, res) => {
  clearRefreshCookie(res);
  return res.json({ message: "Logged out" });
};
