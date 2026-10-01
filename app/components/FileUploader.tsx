import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "../lib/utils";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      setSelectedFile(file);
      onFileSelect?.(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 20 * 1024 * 1024,
  });

  const handleRemove = () => {
    setSelectedFile(null);
    onFileSelect?.(null);
  };

  if (selectedFile) {
    return (
      <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl p-3.5">
        {/* PDF icon */}
        <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-red-600 text-xs font-bold">PDF</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-800 truncate">{selectedFile.name}</p>
          <p className="text-xs text-stone-400">{formatSize(selectedFile.size)}</p>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="text-stone-300 hover:text-stone-600 transition-colors p-1 rounded shrink-0"
          aria-label="Remove file"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150
          ${isDragActive
            ? "border-stone-400 bg-stone-50"
            : "border-stone-200 hover:border-stone-300 hover:bg-stone-50/50"}
        `}
      >
        <input {...getInputProps()} />
        <p className="text-stone-400 text-sm">
          {isDragActive
            ? "Drop it here"
            : "Drag your PDF here, or click to browse"}
        </p>
        <p className="text-xs text-stone-300 mt-1">PDF only · max 20 MB</p>
      </div>

      {fileRejections.length > 0 && (
        <p className="text-xs text-red-500 mt-2">
          {fileRejections[0].errors[0]?.message ?? "Invalid file"}
        </p>
      )}
    </div>
  );
};

export default FileUploader;
