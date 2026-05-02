export interface FileInfo {
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

export interface StatsResponse {
  totalUploads: number;
  totalDownloads: number;
  activeFiles: number;
  storageUsed: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
  token: string;
}

export interface PaginatedFiles {
  files: FileInfo[];
  nextCursor: string | null;
}
