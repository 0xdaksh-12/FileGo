import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useFiles } from "@/hooks/use-queries";
import { useDeleteFile } from "@/hooks/use-mutations";
import { formatBytes } from "@/utils/format";
import { useState } from "react";

export default function FileList() {
  const { 
    data, 
    isLoading: loading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useFiles();
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFile();
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  const files = data?.pages.flatMap((page) => page.files) || [];

  const handleDelete = (id: string) => {
    setDeletingFileId(id);
    deleteFile(id, { onSettled: () => setDeletingFileId(null) });
  };

  const copyLink = (fileId: string) => {
    const link = `${window.location.origin}/download/${fileId}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Download link copied to clipboard");
    });
  };

  const formatFileSize = formatBytes;

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  };

  const getExpiryStatus = (expiresAt: string | null | undefined) => {
    if (!expiresAt)
      return { text: "Never expires", color: "bg-success/10 text-success" };

    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffInMs = expiry.getTime() - now.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMs < 0)
      return { text: "Expired", color: "bg-danger/10 text-danger" };
    if (diffInHours < 24)
      return { text: "Expires today", color: "bg-danger/10 text-danger" };
    if (diffInDays <= 7)
      return {
        text: `Expires in ${diffInDays} day${diffInDays !== 1 ? "s" : ""}`,
        color: "bg-yellow-100 text-yellow-800",
      };

    return { text: "Active", color: "bg-success/10 text-success" };
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "movie";
    if (mimeType.startsWith("audio/")) return "audiotrack";
    if (mimeType === "application/pdf") return "picture_as_pdf";
    if (mimeType.includes("zip") || mimeType.includes("archive")) return "inventory_2";
    if (mimeType.includes("text")) return "description";
    return "description";
  };

  const getFileIconBg = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "bg-green-100";
    if (mimeType.startsWith("video/")) return "bg-purple-100";
    if (mimeType.startsWith("audio/")) return "bg-orange-100";
    if (mimeType === "application/pdf") return "bg-blue-100";
    if (mimeType.includes("zip") || mimeType.includes("archive"))
      return "bg-gray-100";
    if (mimeType.includes("text")) return "bg-blue-100";
    return "bg-gray-100";
  };

  if (loading && files.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Recent Uploads</h3>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-gray-200 last:border-b-0 p-4 sm:p-6 animate-pulse">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg shrink-0"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 sm:w-48 bg-gray-200 rounded"></div>
                      <div className="h-3 w-24 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    );
  }

  if (files.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Recent Uploads</h3>
        </div>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-gray-400 text-[32px]">upload</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                No files uploaded yet
              </h4>
              <p className="text-gray-600">
                Upload your first file to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Recent Uploads</h3>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {files.map((file) => {
            const expiryStatus = getExpiryStatus(file.expiresAt);
            return (
              <div
                key={file.id}
                className="border-b border-gray-200 last:border-b-0 p-4 sm:p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${getFileIconBg(
                        file.mimeType
                      )} rounded-lg flex items-center justify-center shrink-0`}
                    >
                      <span className="material-symbols-outlined text-gray-600 text-[24px]">
                        {getFileIcon(file.mimeType)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium sm:font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-[250px]">
                        {file.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{getTimeAgo(file.uploadedAt)}</span>
                        <span className="flex items-center">
                          <span className="material-symbols-outlined text-[14px] mr-1">download</span>
                          {file.downloadCount}
                        </span>
                        {file.hasPassword && (
                          <span className="flex items-center">
                            <span className="material-symbols-outlined text-[14px] mr-1">lock</span>
                            Protected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span
                      className={`px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full ${expiryStatus.color}`}
                    >
                      {expiryStatus.text}
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyLink(file.id)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      >
                        <span className="material-symbols-outlined text-[20px]">link</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(file.id)}
                        disabled={deletingFileId === file.id && isDeleting}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-danger hover:bg-red-50"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      {hasNextPage && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-8 py-2 border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            {isFetchingNextPage ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Loading...
              </div>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </section>
  );
}
