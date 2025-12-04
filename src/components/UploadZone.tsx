import { type DragEvent, useState } from "react";
import { X, UploadCloud } from "lucide-react";

interface UploadZoneProps {
  maxSizeMB?: number;
  allowedFormats?: string[];
  onFilesChange?: (files: File[]) => void;
  files: File[];
}

export default function UploadZone({
  maxSizeMB = 10,
  allowedFormats = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "application/rtf",
    "text/csv",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.oasis.opendocument.presentation",
  ],
  onFilesChange,
  files,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const validateFiles = (incoming: File[]) => {
    return incoming.filter((file) => {
      const isValidSize = file.size <= maxSizeMB * 1024 * 1024;
      const isValidFormat = allowedFormats.includes(file.type);
      
      if (!isValidSize) {
        alert(`File ${file.name} exceeds ${maxSizeMB}MB limit`);
        return false;
      }
      
      if (!isValidFormat) {
        alert(`File ${file.name} has unsupported format`);
        return false;
      }
      
      return true;
    });
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    const validated = validateFiles(incoming);
    const filtered = validated.filter(newFile => 
      !files.some(existingFile => 
        existingFile.name === newFile.name && 
        existingFile.size === newFile.size && 
        existingFile.lastModified === newFile.lastModified
      )
    );
    onFilesChange?.([...files, ...filtered]);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const incoming = Array.from(e.dataTransfer.files);
    const validated = validateFiles(incoming);
    const filtered = validated.filter(newFile => 
      !files.some(existingFile => 
        existingFile.name === newFile.name && 
        existingFile.size === newFile.size && 
        existingFile.lastModified === newFile.lastModified
      )
    );
    onFilesChange?.([...files, ...filtered]);
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = files.filter((_, i) => i !== index);
    onFilesChange?.(updated);
  };

  return (
    <div>
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex flex-col items-center justify-center w-full gap-3 p-8 text-white transition-all border-2 border-dashed cursor-pointer rounded-2xl ${
          isDragging 
            ? 'bg-green-500/20 border-green-500' 
            : 'bg-white/20 border-transparent hover:bg-gray-50 hover:text-royalBlue'
        }`}
      >
        <UploadCloud className="w-10 h-10 opacity-70" />
        <p className="font-semibold">
          {isDragging ? 'Drop files here' : 'Drop your files here or click to upload'}
        </p>
        <p className="text-sm text-gray-400">
          Max size: {maxSizeMB}MB • Accepted: All files
        </p>

        <input
          type="file"
          multiple
          className="hidden"
          onChange={handleSelect}
        />
      </label>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between w-full max-w-full p-3 overflow-hidden border rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium text-gray-800 truncate w-full max-w-[240px] xs:max-w-[350px] md:max-w-[390px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)}MB
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => removeFile(index, e)}
                className="p-2 rounded-full hover:bg-red-100"
                type="button"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}