import { useEffect, useMemo, useState } from "react";
import NavBar from "../components/NavBar.jsx";
import Sidebar from "../components/Siderbar.jsx";
import Modal from "../components/Modal.jsx";
import FolderCard from "../components/FolderCard.jsx";
import FileCard from "../components/FileCard.jsx";
import { getFiles, uploadFile, getFolders, createFolder } from "../api";

export default function Dashboard() {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [listFolders, setListFolders] = useState([]);
  const [listFiles, setListFiles] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [busy, setBusy] = useState(false);

  const parentId = useMemo(() => currentFolder?.id ?? null, [currentFolder]);

  // ---------- Refresh folders and files ----------
  const refresh = async () => {
    setBusy(true);
    try {
      const [foldersRes, filesRes] = await Promise.all([
        getFolders(parentId),
        getFiles(parentId),
      ]);

      console.log("Fetched folders:", foldersRes);
      console.log("Fetched files:", filesRes);

      setListFolders(Array.isArray(foldersRes) ? foldersRes : []);
      setListFiles(Array.isArray(filesRes) ? filesRes : []);
    } catch (err) {
      console.error("Error fetching folders/files:", err);
      setListFolders([]);
      setListFiles([]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [parentId]);

  // ---------- Upload File ----------
const handleUpload = async (e) => {
  e.preventDefault();

  const file = e.target.elements.file.files[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append("file", file);

    if (parentId !== null && parentId !== undefined) {
      formData.append("folder_id", parentId.toString());
    }

    const res = await uploadFile(formData); // ✅ No parentId passed separately

    console.log("Uploaded file:", res.data);
    setShowUpload(false);
    e.target.reset();
    refresh();
  } catch (err) {
    console.error("Upload failed:", err.response?.data || err.message);
  }
};


  // ---------- Create New Folder ----------
  const handleNewFolder = async (e) => {
    e.preventDefault();
    const folderName = e.target.folder_name.value.trim();
    if (!folderName) return;

    try {
      await createFolder(folderName, parentId);
      setShowNewFolder(false);
      e.target.reset();
      refresh();
    } catch (err) {
      console.error("Create folder failed:", err);
    }
  };

  // ---------- Navigation ----------
  const openFolder = (f) => setCurrentFolder(f);
  const goUp = () => setCurrentFolder(null);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex flex-1">
        <Sidebar
          onUpload={() => setShowUpload(true)}
          onNewFolder={() => setShowNewFolder(true)}
        />
        <main className="flex-1 p-5 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold">
              My Drive {currentFolder ? ` / ${currentFolder.folder_name}` : ""}
            </div>
            {currentFolder && (
              <button
                onClick={goUp}
                className="text-sm px-3 py-1 rounded bg-gray-200"
              >
                Go to Root
              </button>
            )}
          </div>

          {busy ? (
            <div className="p-6 text-black">Loading…</div>
          ) : (
            <>
              {Array.isArray(listFolders) && listFolders.length > 0 && (
                <>
                  <h3 className="text-sm text-black mb-2">Folders</h3>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 mb-6">
                    {listFolders.map((f) => (
                      <FolderCard key={f.id} folder={f} onOpen={openFolder} />
                    ))}
                  </div>
                </>
              )}

              <h3 className="text-sm text-black mb-2">Files</h3>
              {!Array.isArray(listFiles) || listFiles.length === 0 ? (
                <div className="text-black">Nothing here yet.</div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                  {listFiles.map((f) => (
                    <FileCard key={f.id} file={f} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Upload Modal */}
      <Modal
        open={showUpload}
        title="Upload file"
        onClose={() => setShowUpload(false)}
      >
        <form onSubmit={handleUpload} className="flex items-center gap-2">
          <input name="file" type="file" className="text-sm" />
          <button className="px-3 py-2 rounded bg-blue-600 text-black">
            Upload
          </button>
        </form>
      </Modal>

      {/* New Folder Modal */}
      <Modal
        open={showNewFolder}
        title="Create folder"
        onClose={() => setShowNewFolder(false)}
      >
        <form onSubmit={handleNewFolder} className="flex items-center gap-2">
          <input
            name="folder_name"
            placeholder="Folder name"
            className="flex-1 border rounded px-3 py-2"
          />
          <button className="px-3 py-2 rounded bg-gray-700 text-black">
            Create
          </button>
        </form>
      </Modal>
    </div>
  );
}
