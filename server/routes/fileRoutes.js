import express from "express";
import multer from "multer";
import supabase from "../supabase/supabaseClient.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const BUCKET = "files";
const bucket = supabase.storage.from(BUCKET);

/* =====================================================
   UPLOAD FILE
===================================================== */
router.post(
  "/upload",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;
      const folderId = req.body.folder_id || null;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Unique path inside Supabase Storage
      const storagePath = `${userId}/${uuidv4()}-${file.originalname}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await bucket.upload(
        storagePath,
        file.buffer,
        {
          contentType: file.mimetype,
          upsert: false,
        }
      );
      if (uploadError) throw uploadError;

      // Insert DB record
      const { data, error: dbError } = await supabase
        .from("files")
        .insert({
          file_name: file.originalname,
          file_type: file.mimetype,
          file_path: storagePath,
          user_id: userId,
          folder_id: folderId,
          is_deleted: false,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      res.json({ file: data });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/* =====================================================
   GET FILES (with signed download URLs)
===================================================== */
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const parentId = req.query.parent_id ?? null;

    let query = supabase
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .eq("is_deleted", false);

    if (parentId !== null && parentId !== "null") {
      query = query.eq("folder_id", parentId);
    } else {
      query = query.is("folder_id", null);
    }

    const { data: files, error } = await query;
    if (error) throw error;

    // Attach signed download URLs
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const { data } = await bucket.createSignedUrl(
          file.file_path,
          60
        );

        return {
          ...file,
          download_url: data?.signedUrl || null,
        };
      })
    );

    res.json({ files: filesWithUrls });
  } catch (err) {
    console.error("Fetch files error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   RENAME FILE
===================================================== */
router.patch("/:id/rename", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name } = req.body;

    const { data, error } = await supabase
      .from("files")
      .update({ file_name: name })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Rename error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   DELETE FILE (SOFT DELETE)
===================================================== */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const fileId = req.params.id;

    const { error } = await supabase
      .from("files")
      .update({ is_deleted: true })
      .eq("id", fileId)
      .eq("user_id", userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
