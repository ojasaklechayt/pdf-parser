'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { uploadDocument } from '../lib/api';

export default function DocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const file = acceptedFiles[0];
      const result = await uploadDocument(file);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
          clearInterval(interval);
          setUploading(false);
          toast({
            title: "Upload Complete",
            description: result.message,
          });
        } else {
          setUploadProgress(progress);
        }
      }, 100);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your document.",
        variant: "destructive",
      });
      setUploading(false);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center">
        <Upload className="w-12 h-12 text-gray-400 mb-4" />
        {uploading ? (
          <div className="w-full max-w-xs">
            <Progress value={uploadProgress} className="w-full" />
            <p className="mt-2 text-sm text-gray-500">Uploading... {uploadProgress}%</p>
          </div>
        ) : isDragActive ? (
          <p className="text-blue-500">Drop the PDF here...</p>
        ) : (
          <>
            <p className="text-gray-600 mb-2">Drag and drop a PDF here, or click to select a file</p>
            <Button>Select PDF</Button>
          </>
        )}
      </div>
    </div>
  );
}
