import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (password: string) => void;
  isLoading: boolean;
}

export default function DownloadModal({
  isOpen,
  onClose,
  onDownload,
  isLoading,
}: DownloadModalProps) {
  const [password, setPassword] = useState("");

  const handleDownload = () => {
    onDownload(password);
    setPassword("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-[32px]">lock</span>
          </div>
          <DialogTitle className="text-xl">Protected File</DialogTitle>
          <p className="text-gray-600 mt-2">
            This file is password protected. Enter the password to download.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="password" className="mb-2 block">Password</Label>
            <Input
              autoFocus
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleDownload()}
              className="mt-2"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="default"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="default"
              onClick={handleDownload}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Downloading...
                </>
              ) : (
                "Download"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
