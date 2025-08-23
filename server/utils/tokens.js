// server/utils/tokens.js
import jwt from "jsonwebtoken";

export function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_TTL || "15m",
  });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_TTL || "30d",
  });
}

export function setRefreshCookie(res, refreshToken) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProd,                 // true only on HTTPS
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth/refresh",      // cookie sent only to refresh endpoint
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  });
}

export function clearRefreshCookie(res) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth/refresh",
  });
}
