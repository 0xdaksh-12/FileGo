import { useParams } from "wouter";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import Header from "@/components/header";
import toast from "react-hot-toast";
import DownloadModal from "@/components/download-model";

interface FileInfo {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  downloadCount: number;
  uploadedAt: string;
  expiresAt?: string;
  hasPassword: boolean;
  isActive: boolean;
}

export default function Download() {
  const { id } = useParams();
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [downloading, setDownloading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchFileInfo = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.get(`/api/files/${id}`);
      setFileInfo(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      setFileInfo(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFileInfo();

    const handler = () => fetchFileInfo();
    document.addEventListener("fileDownloaded", handler);
    document.addEventListener("fileUploaded", handler);

    return () => {
      document.removeEventListener("fileDownloaded", handler);
      document.removeEventListener("fileUploaded", handler);
    };
  }, [fetchFileInfo]);

  const handleDownload = async (password: string) => {
    if (!id || !fileInfo) return;

    if (fileInfo.hasPassword && !password) {
      toast.error("Please enter the password to download this file.");
      return;
    }

    try {
      setDownloading(true);

      const response = await api.post(
        `/api/files/${id}/download`,
        fileInfo.hasPassword ? { password } : undefined
      );
      const { downloadUrl } = response.data;

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileInfo.name || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success("Your file download has started successfully.");
      setModalOpen(false);

      setFileInfo((prev) => prev ? ({
        ...prev,
        downloadCount: (prev.downloadCount || 0) + 1,
      }) : null);
    } catch (err: any) {
      toast.error(err.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  if (loading) {
    return (
      <div className="font-inter bg-gray-50 min-h-screen">
        <Header />
        <div className="max-w-md mx-auto pt-16">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading file information...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !fileInfo) {
    return (
      <div className="font-inter bg-gray-50 min-h-screen">
        <Header />
        <div className="max-w-md mx-auto pt-16">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  File Not Found
                </h3>
                <p className="text-gray-600">
                  This file may have expired, been deleted, or the link is
                  invalid.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-md mx-auto pt-16">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">download</span>
            </div>
            <CardTitle className="text-xl">Download File</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">File Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>File name:</span>
                  <span className="font-medium wrap-break-word max-w-[60%] text-right">
                    {fileInfo.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>File size:</span>
                  <span className="font-medium">
                    {formatFileSize(fileInfo.size)}
                  </span>
                </div>
                {fileInfo.downloadCount !== undefined && (
                  <div className="flex justify-between">
                    <span>Downloads:</span>
                    <span className="font-medium">
                      {fileInfo.downloadCount}
                    </span>
                  </div>
                )}
                {fileInfo.expiresAt && (
                  <div className="flex justify-between">
                    <span>Expires:</span>
                    <span className="font-medium">
                      {formatDate(fileInfo.expiresAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {fileInfo.hasPassword ? (
              <>
                <Button
                  onClick={() => setModalOpen(true)}
                  className="w-full"
                  disabled={downloading}
                >
                  {downloading ? "Downloading..." : "Download File"}
                </Button>

                <DownloadModal
                  isOpen={isModalOpen}
                  onClose={() => setModalOpen(false)}
                  onDownload={handleDownload}
                  isLoading={downloading}
                />
              </>
            ) : (
              <Button
                onClick={() => handleDownload("")}
                className="w-full"
                disabled={downloading}
              >
                {downloading ? "Downloading..." : "Download File"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
