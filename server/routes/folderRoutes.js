// server/routes/folderRoutes.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import supabase from "../supabase/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Create new folder
router.post("/create", verifyToken, async (req, res) => {
  

  
  const { folder_name, parent_folder_id } = req.body;    


  if (!folder_name) return res.status(400).json({ error: "Folder name is required" });

  try {
    const newFolder = {
     //// id: uuidv4(),
      folder_name: folder_name, 
      parent_id: parent_folder_id || null,
      user_id: req.user.id,
      created_at: new Date().toISOString(),
};
// Assuming you have a "folders" table in Supabase
    const { data, error } = await supabase
      .from("folders")
      .insert([newFolder])
      .select();

    if (error) throw error;

    res.json({ folder: data[0] });
  } catch (err) {
    console.error("Folder creation failed:", err);
    res.status(500).json({ error: "Folder creation failed" });
  }
});
router.get("/", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { parent_id } = req.query;

    let query = supabase.from("folders").select("*").eq("user_id", user_id);

    if (parent_id === undefined || parent_id === "null") {
      query = query.is("parent_id", null);
    } else {
      // if parent_id is a numeric id, parse it accordingly
      query = query.eq("parent_id", parent_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.set("Cache-Control", "no-store");  // disable caching
    res.json(data);
  } catch (err) {
    console.error("Folder fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


export default router;
