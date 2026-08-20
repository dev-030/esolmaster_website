import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFolder,
  deleteFolder,
  getFolderById,
  getFolders,
  updateFolder,
} from "./api";

export const useGetFolders = (parentId?: string) => {
  return useQuery({
    queryKey: ["folders", parentId],
    queryFn: () => getFolders(parentId),
    staleTime: 30 * 1000,      // treat data as fresh for 30 seconds
    gcTime: 5 * 60 * 1000,    // keep in cache for 5 minutes
  });
};

export const useGetFolderById = (id: string) => {
  return useQuery({
    queryKey: ["folder", id],
    queryFn: () => getFolderById(id),
    enabled: !!id,
    staleTime: 60 * 1000,      // treat data as fresh for 60 seconds
    gcTime: 5 * 60 * 1000,    // keep in cache for 5 minutes
  });
};

export const useCreateFolderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["folder"] });
    },
  });
};

export const useUpdateFolderMutation = (parentId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateFolder(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["folder"] });
    },
  });
};

export const useDeleteFolderMutation = (parentId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFolder,
    onMutate: async (folderId: string) => {
      await queryClient.cancelQueries({ queryKey: ["folders"] });
      await queryClient.cancelQueries({ queryKey: ["folder"] });

      queryClient.setQueriesData({ queryKey: ["folders"] }, (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.filter((f: any) => f.id !== folderId);
      });

      queryClient.setQueriesData({ queryKey: ["folder"] }, (old: any) => {
        if (!old) return old;
        if (old.children && Array.isArray(old.children)) {
          return {
            ...old,
            children: old.children.filter((f: any) => f.id !== folderId),
          };
        }
        return old;
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["folder"] });
    },
  });
};
