'use client';

import * as React from "react";
import { UploadIcon, Cross2Icon, ReloadIcon } from "@radix-ui/react-icons";
import Dropzone, { type FileRejection } from "react-dropzone";
import { toast } from "sonner";

import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileIcon, XIcon } from "lucide-react"; // Assuming you're using lucide-react for icons

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onUpload: (files: File[]) => Promise<void>;
  maxSize?: number;
  maxFileCount?: number;
  multiple?: boolean;
}

export function FileUploader({
  onUpload,
  maxSize = 1024 * 1024 * 16, // 16MB
  maxFileCount = 5,
  multiple = true,
  className,
  ...props
}: FileUploaderProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && acceptedFiles.length > 1) {
        toast.error("Cannot upload more than 1 file at a time");
        return;
      }

      if (files.length + acceptedFiles.length > maxFileCount) {
        toast.error(`Cannot upload more than ${maxFileCount} files`);
        return;
      }

      setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          if (errors[0]?.code === "file-too-large") {
            toast.error(`File ${file.name} is too large. Max size is ${formatBytes(maxSize)}`);
          } else {
            toast.error(`File ${file.name} was rejected`);
          }
        });
      }
    },
    [files, maxFileCount, multiple, maxSize]
  );

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      await onUpload(files);
      toast.success('All files uploaded successfully');
      setFiles([]); // Clear files after successful upload
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  function onRemove(index: number) {
    setFiles(files.filter((_, i) => i !== index));
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Dropzone
        onDrop={onDrop}
        maxSize={maxSize}
        maxFiles={maxFileCount}
        multiple={multiple}
        disabled={isUploading}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              "cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors",
              isDragActive && "border-blue-500 bg-blue-50",
              (files.length >= maxFileCount || isUploading) && "pointer-events-none opacity-50"
            )}
          >
            <input {...getInputProps()} />
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag & drop files here, or click to select files
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Max file size: {formatBytes(maxSize)}
            </p>
          </div>
        )}
      </Dropzone>
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between rounded-md bg-gray-800 p-3 transition-colors hover:bg-gray-700"
            >
              <div className="flex items-center space-x-3">
                <FileIcon className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium text-gray-200">{file.name}</span>
              </div>
              <button
                onClick={() => onRemove(index)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
                disabled={isUploading}
              >
                <XIcon className="h-5 w-5" />
                <span className="sr-only">Remove file</span>
              </button>
            </div>
          ))}
        </div>
      )}
      {files.length > 0 && !isUploading && (
        <Button onClick={handleUpload} className="mt-2">
          Upload Files
        </Button>
      )}
      {isUploading && (
        <div className="flex items-center justify-center mt-2">
          <ReloadIcon className="h-5 w-5 text-green-500 animate-spin mr-2" />
          <span>Uploading...</span>
        </div>
      )}
    </div>
  );
}