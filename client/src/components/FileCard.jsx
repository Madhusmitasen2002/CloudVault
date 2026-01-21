export default function FileCard({
  file,
  onDownload,
  onDelete,
  onRename,
  onShare,
}) {
  return (
    <div className="border rounded p-3 bg-white">
      <div className="font-medium truncate">📄 {file.file_name}</div>
      <div className="text-xs text-gray-500">{file.file_type}</div>

      <div className="mt-2 flex gap-2 flex-wrap">
        <button
          onClick={() => onDownload?.(file)}
          className="text-xs px-2 py-1 bg-gray-900 text-black rounded"
        >
          Download
        </button>

        <button
          onClick={() => onShare?.(file)}
          className="text-xs px-2 py-1 bg-blue-600 text-black rounded"
        >
          Share
        </button>

        <button
          onClick={() => {
            const n = prompt("Rename to:", file.file_name);
            if (n && n !== file.file_name) onRename?.(file, n);
          }}
          className="text-xs px-2 py-1 bg-gray-200 rounded"
        >
          Rename
        </button>

        <button
          onClick={() => onDelete?.(file)}
          className="text-xs px-2 py-1 bg-red-600 text-black rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
