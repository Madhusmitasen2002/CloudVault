export default function Sidebar({ onNewFolder, onUpload }) {
  return (
    <aside className="w-64 shrink-0 border-r p-4 bg-white h-[calc(100vh-3.5rem)] sticky top-14">
      <button onClick={onUpload} className="w-full mb-3 px-3 py-2 rounded bg-blue-600 text-black">
        Upload
      </button>
      <button onClick={onNewFolder} className="w-full px-3 py-2 rounded bg-blue-400 hover:bg-gray-200">
        New Folder
      </button>
    </aside>
  );
}
