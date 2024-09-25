'use client';

import React, { useState, useEffect } from 'react';
import { FileUploader } from './FileUploader';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StorageFile {
  name: string;
  size: number;
  lastModified: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/hetzner/list');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      } else {
        toast.error('Failed to fetch files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Error occurred while fetching files');
    }
  };

  const handleUpload = async (filesToUpload: File[]) => {
    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/hetzner', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          toast.success(`File ${file.name} uploaded successfully`);
        } else {
          const errorData = await response.json();
          toast.error(`Failed to upload ${file.name}: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Error occurred while uploading ${file.name}`);
        throw error;
      }
    }

    // After all uploads are complete, refresh the file list
    fetchFiles();
  };

  const openDeleteModal = (fileName: string) => {
    setFileToDelete(fileName);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setFileToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;

    try {
      const response = await fetch(`/api/hetzner/delete?fileName=${encodeURIComponent(fileToDelete)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`File ${fileToDelete} deleted successfully`);
        fetchFiles(); // Refresh the file list
      } else {
        const errorData = await response.json();
        toast.error(`Failed to delete ${fileToDelete}: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Error occurred while deleting ${fileToDelete}`);
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">File Storage</h1>
      <FileUploader
        onUpload={handleUpload}
        maxSize={1024 * 1024 * 16} // 16MB
        maxFileCount={5}
        multiple={true}
      />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <Card key={file.name} className="relative">
            <Button
              className="absolute top-2 right-2 h-6 w-6 p-0"
              variant="outline"
              size="sm"
              onClick={() => openDeleteModal(file.name)}
            >
              <Cross2Icon className="h-4 w-4" />
              <span className="sr-only">Delete file</span>
            </Button>
            <CardHeader>
              <CardTitle className="text-lg truncate pr-8">{file.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Size: {formatBytes(file.size)}</p>
              <p>Last Modified: {new Date(file.lastModified).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the file "{fileToDelete}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteModal}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}