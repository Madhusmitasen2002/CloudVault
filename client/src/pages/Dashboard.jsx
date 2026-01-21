import { useEffect, useMemo, useState } from "react";
import NavBar from "../components/NavBar.jsx";
import Sidebar from "../components/Siderbar.jsx";
import Modal from "../components/Modal.jsx";
import FolderCard from "../components/FolderCard.jsx";
import FileCard from "../components/FileCard.jsx";
import {
  getFiles,
  uploadFile,
  getFolders,
  createFolder,
} from "../api";
import { deleteFile, renameFile } from "../api";

export default function Dashboard() {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [listFolders, setListFolders] = useState([]);
  const [listFiles, setListFiles] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [busy, setBusy] = useState(false);

  const parentId = useMemo(() => currentFolder?.id ?? null, [currentFolder]);

  // ---------- Fetch ----------
  const refresh = async () => {
    setBusy(true);
    try {
      const [foldersRes, filesRes] = await Promise.all([
        getFolders(parentId),
        getFiles(parentId),
      ]);

      setListFolders(Array.isArray(foldersRes) ? foldersRes : []);
      setListFiles(Array.isArray(filesRes) ? filesRes : []);
    } catch (err) {
      console.error("Fetch failed:", err);
      setListFolders([]);
      setListFiles([]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [parentId]);

  // ---------- Upload ----------
  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.elements.file.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (parentId) formData.append("folder_id", parentId);

      await uploadFile(formData);
      setShowUpload(false);
      e.target.reset();
      refresh();
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  // ---------- Folder ----------
  const handleNewFolder = async (e) => {
    e.preventDefault();
    const name = e.target.folder_name.value.trim();
    if (!name) return;

    try {
      await createFolder(name, parentId);
      setShowNewFolder(false);
      e.target.reset();
      refresh();
    } catch (err) {
      console.error("Create folder failed:", err);
    }
  };

  // ---------- File Actions ----------
  const handleDownload = (file) => {
    if (file.download_url) {
      window.open(file.download_url, "_blank");
    } else {
      alert("Download URL not available");
    }
  };

  const handleDelete = async (file) => {
  if (!window.confirm(`Delete "${file.file_name}"?`)) return;

  try {
    await deleteFile(file.id);

    setListFiles((prev) => prev.filter((f) => f.id !== file.id));
  } catch (err) {
    console.error("Delete failed:", err);
  }
};


const handleRename = async (file, newName) => {
  try {
    const res = await renameFile(file.id, newName);

    setListFiles((prev) =>
      prev.map((f) => (f.id === file.id ? res.data : f))
    );
  } catch (err) {
    console.error("Rename failed:", err);
  }
};

  const handleShare = (file) => {
    alert(`Share clicked for "${file.file_name}"`);
    // Next step: open Share Modal
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
          <div className="flex justify-between mb-4">
            <div className="text-lg font-semibold">
              My Drive {currentFolder ? `/ ${currentFolder.folder_name}` : ""}
            </div>
            {currentFolder && (
              <button onClick={goUp} className="px-3 py-1 bg-gray-200 rounded">
                Go to Root
              </button>
            )}
          </div>

          {busy ? (
            <div>Loading…</div>
          ) : (
            <>
              {listFolders.length > 0 && (
                <>
                  <h3 className="mb-2">Folders</h3>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 mb-6">
                    {listFolders.map((f) => (
                      <FolderCard key={f.id} folder={f} onOpen={openFolder} />
                    ))}
                  </div>
                </>
              )}

              <h3 className="mb-2">Files</h3>
              {listFiles.length === 0 ? (
                <div>Nothing here yet.</div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                  {listFiles.map((f) => (
                    <FileCard
                      key={f.id}
                      file={f}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                      onRename={handleRename}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Upload Modal */}
      <Modal open={showUpload} title="Upload file" onClose={() => setShowUpload(false)}>
        <form onSubmit={handleUpload} className="flex gap-2">
          <input name="file" type="file" />
          <button className="px-3 py-2 bg-blue-600 text-black rounded">
            Upload
          </button>
        </form>
      </Modal>

      {/* New Folder Modal */}
      <Modal open={showNewFolder} title="Create folder" onClose={() => setShowNewFolder(false)}>
        <form onSubmit={handleNewFolder} className="flex gap-2">
          <input name="folder_name" className="border px-3 py-2 flex-1" />
          <button className="px-3 py-2 bg-gray-700 text-black rounded">
            Create
          </button>
        </form>
      </Modal>
    </div>
  );
}
