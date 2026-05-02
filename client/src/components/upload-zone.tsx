import { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import toast from "react-hot-toast";
import ShareModal from "./share-model";
import { useFileStore } from "@/store/useFileStore";
import { useQueryClient } from "@tanstack/react-query";

interface UploadedFileMeta {
  shareUrl: string;
  file: {
    name: string;
    size: number;
    expiry?: string;
    hasPassword?: boolean;
  };
}

export default function UploadZone() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [expiry, setExpiry] = useState("7d");
  const [password, setPassword] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFileMeta | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();
  
  const { uploading: isUploading, setUploading } = useFileStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds the 2GB limit.`);
        return false;
      }
      return true;
    });
    setSelectedFiles(validFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleUpload = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!selectedFiles.length) {
      toast.error("No files selected. Please choose a file.");
      return;
    }

    setUploading(true);

    try {
      const file = selectedFiles[0];

      const response = await api.post("/api/files/upload-url", {
        name: file.name,
        type: file.type,
        size: file.size,
        expiresAt: expiry,
        password: password || undefined,
      });

      const { id, uploadUrl, file: fileMeta } = response.data;

      if (!uploadUrl) {
        toast.error("Failed to get upload URL");
        return;
      }

      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || file.size)
          );
          setUploadProgress(percentCompleted);
        },
      });

      const shareUrl = `${window.location.origin}/download/${id}`;

      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });

      setUploadedFile({ file: fileMeta, shareUrl });
      setShowShareModal(true);
      setSelectedFiles([]);
      setPassword("");
      toast.success("Upload successful! Your file is ready to share.");
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message || "Unknown error"}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <>
      <section className="mb-12">
        {selectedFiles.length === 0 ? (
          <div
            {...getRootProps()}
            className={`bg-white rounded-xl shadow-sm border-2 border-dashed transition-colors 
    p-6 sm:p-8 md:p-10 text-center cursor-pointer
    ${
      isDragActive
        ? "border-primary bg-blue-50"
        : "border-gray-300 hover:border-primary"
    }`}
          >
            <input {...getInputProps()} />
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-gray-400 text-[32px]">upload_file</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
              {isDragActive ? "Drop your file here" : "Drop your file here"}
            </h3>
            <p className="text-sm text-gray-600 mb-4 sm:mb-6">
              or click to browse from your device
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
              <span className="flex items-center">
                <span className="material-symbols-outlined text-green-500 mr-1 sm:mr-2 text-[18px]">check_circle</span>Max
                2GB per file
              </span>
              <span className="flex items-center">
                <span className="material-symbols-outlined text-green-500 mr-1 sm:mr-2 text-[18px]">check_circle</span>All
                file types supported
              </span>
              <span className="flex items-center">
                <span className="material-symbols-outlined text-green-500 mr-1 sm:mr-2 text-[18px]">check_circle</span>Secure
                encryption
              </span>
            </div>
          </div>
        ) : (
          <Card className="mt-4 shadow-sm">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Selected Files
              </h4>
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2"
                >
                  <div className="flex items-center space-x-3">
                    <span className="material-symbols-outlined text-gray-400">description</span>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    onClick={() =>
                      setSelectedFiles((files) =>
                        files.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="mt-6 bg-gray-50 shadow-sm border-gray-200">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Upload Options</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="expiry" className="mb-2 block">
                  Expiry Date
                </Label>
                <Select value={expiry} onValueChange={setExpiry}>
                  <SelectTrigger id="expiry" className="w-full bg-white">
                    <SelectValue placeholder="Select expiry" />
                  </SelectTrigger>
                  <SelectContent className="w-(--radix-select-trigger-width)">
                    <SelectItem value="1h" className="cursor-pointer">1 hour</SelectItem>
                    <SelectItem value="1d" className="cursor-pointer">1 day</SelectItem>
                    <SelectItem value="7d" className="cursor-pointer">7 days</SelectItem>
                    <SelectItem value="30d" className="cursor-pointer">30 days</SelectItem>
                    <SelectItem value="never" className="cursor-pointer">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fileKey" className="mb-2 block">
                  Password Protection
                </Label>
                <Input
                  id="fileKey"
                  type="password"
                  placeholder="Optional password"
                  value={password}
                  autoComplete="username"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="w-full bg-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {selectedFiles.length} file
                {selectedFiles.length !== 1 ? "s" : ""} selected
              </div>
              <Button
                variant="default"
                size="default"
                className="px-6 relative overflow-hidden"
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <span className="text-xs mb-1 font-bold">{uploadProgress}%</span>
                    <div className="w-24 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  "Upload Files"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {uploadedFile && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setUploadedFile(null);
          }}
          uploadedFile={uploadedFile}
        />
      )}
    </>
  );
}
