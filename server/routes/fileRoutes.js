import express from "express";
import multer from "multer";
import supabase from "../supabase/supabaseClient.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const BUCKET = "files";
const bucket = supabase.storage.from(BUCKET);

// ES module __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ---------- Upload File from Frontend ----------


// Assuming 'upload' is multer middleware configured properly.

router.post("/upload", verifyToken,upload.single("file"), async (req, res) => {
  try {
     console.log("req.user:", req.user);

    console.log("foler_id", req.body.folder_id);
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
   const userId = req.user.id;
   
    const  folder_id  = req.body.folder_id;
    const folderId = folder_id && folder_id !== "undefined" ? parseInt(folder_id, 10) : null;
    
    
    
    // Generate unique file name to avoid collisions
    const uniqueFileName = `${uuidv4()}-${file.originalname}`;

    // Destination path inside uploads folder
    const uploadPath = path.join(__dirname, "..", "uploads", uniqueFileName);

    // Write the file buffer to disk
    fs.writeFileSync(uploadPath, file.buffer);

    // The path you want to save in DB can be relative to your project or just file name
    // For example: "uploads/uniqueFileName"
    const filePathForDB = `uploads/${uniqueFileName}`;
    console.log("Inserting into files table:", {
    file_name: file.originalname,
    file_path: filePathForDB,
    user_id: userId,
    folder_id: folderId,
});


    // Insert into DB
    const { data, error: dbError } = await supabase
      .from("files")
      .insert({
        file_name: file.originalname,
        file_path: filePathForDB,  // relative path to the file on disk
        user_id: userId,
        folder_id: folderId,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    res.json({ message: "File uploaded and saved locally successfully", file: data });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: err.message });
  }
});




router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("Authenticated user ID:", req.user.id);

    const userId = req.user.id;

    const { data: files, error } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    console.log("Files fetched:", files);

    res.json({ files });
  } catch (err) {
    console.error("Fetch all files error:", err);
    res.status(500).json({ error: err.message });
  }
});




// ---------- Download file ----------
router.get("/:id/download", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const fileId = req.params.id;

    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", userId)
      .single();

    if (error || !file) return res.status(404).json({ error: "File not found" });

    const { data: signedData, error: urlError } = await bucket.createSignedUrl(
      file.file_path,
      60
    );
    if (urlError) throw urlError;

    res.json({ url: signedData.signedUrl });
  } catch (err) {
    console.error("Download error:", err.message);
    res.status(500).json({ error: "Failed to download file" });
  }
});

// ---------- Delete file ----------
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const fileId = req.params.id;

    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", userId)
      .single();

    if (error || !file) return res.status(404).json({ error: "File not found" });

    // Remove from storage
    const { error: storageError } = await bucket.remove([file.file_path]);
    if (storageError) throw storageError;

    // Remove from DB
    const { error: dbError } = await supabase.from("files").delete().eq("id", fileId);
    if (dbError) throw dbError;

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;
