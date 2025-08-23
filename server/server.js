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

const allowedOrigins = [
  'http://localhost:5173',
  'https://cloud-vault-mu.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
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