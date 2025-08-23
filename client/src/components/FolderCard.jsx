export default function FolderCard({ folder, onOpen }) {
  return (
    <button onClick={() => onOpen(folder)} className="border rounded p-3 text-left hover:shadow-sm bg-white">
      <div className="font-medium">📁 {folder.folder_name}</div>
      <div className="text-xs text-black">ID: {folder.id}</div>
    </button>
  );
}
