import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { FileInfo, StatsResponse, PaginatedFiles } from "../types/api";

export const useFiles = () => {
  return useInfiniteQuery({
    queryKey: ["files"],
    queryFn: async ({ pageParam }) => {
      const res = await api.get<PaginatedFiles>("/files", {
        params: { cursor: pageParam, limit: 10 },
      });
      return res.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30000,
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await api.get<StatsResponse>("/files/stats");
      return res.data;
    },
    staleTime: 60000,
  });
};

export const useFileInfo = (id: string | undefined) => {
  return useQuery({
    queryKey: ["file", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await api.get<FileInfo>(`/files/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};
