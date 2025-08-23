import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"; // your routes
import fileRoutes from "./routes/fileRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";
import supabase from "./supabase/supabaseClient.js";

dotenv.config();

const app = express();

// ====== CORS ======
app.use(cors({
  origin: "http://localhost:5173", // your frontend dev URL
  credentials: true, 
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]// if using cookies or auth
}));

// ====== MIDDLEWARE ======
app.use(express.json()); // parse JSON requests
app.use(express.urlencoded({ extended: true }));

// ====== ROUTES ======
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/folders", folderRoutes);
app.get("/",(req,res)=>{
  res.json({msg:"server is running"});
})
// ====== START SERVER ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
async function deleteUndefined() {
  const { data, error } = await supabase.storage.from('files').remove(['undefined']);
  console.log('Delete result:', data, error);
}

deleteUndefined();